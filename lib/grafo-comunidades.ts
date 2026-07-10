export type NodoConComunidad = {
  id: string;
  label: string;
  type: string;
  val?: number;
  community?: string;
  communityLabel?: string;
};

export type AristaDeComunidad = {
  source: string;
  target: string;
  kind?: 'rel' | 'mesh';
  prim?: boolean;
};

export type CentroComunidad = {
  id: string;
  label: string;
  x: number;
  y: number;
  radius: number;
  count: number;
};

const ITEM_TYPES = new Set(['anuncio', 'iniciativa', 'caso']);
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * La comunidad de un registro es su relación primaria (su "casa"). Los hubs
 * secundarios votan por la casa de los registros que conectan. El resultado es
 * determinista y no cambia el color semántico por poder/tipo.
 */
export function asignarComunidades<T extends NodoConComunidad>(
  nodes: T[],
  links: AristaDeComunidad[],
): T[] {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const rel = links.filter((link) => link.kind !== 'mesh');
  const hubDegree = new Map<string, number>();
  const hubsByItem = new Map<string, string[]>();

  for (const link of rel) {
    const source = byId.get(link.source);
    const target = byId.get(link.target);
    if (!source || !target) continue;
    const itemId = ITEM_TYPES.has(source.type) ? source.id : target.id;
    const hubId = itemId === source.id ? target.id : source.id;
    hubDegree.set(hubId, (hubDegree.get(hubId) ?? 0) + 1);
    const hubs = hubsByItem.get(itemId) ?? [];
    hubs.push(hubId);
    hubsByItem.set(itemId, hubs);
  }

  const communityByItem = new Map<string, string>();
  for (const link of rel) {
    if (!link.prim) continue;
    const source = byId.get(link.source);
    const target = byId.get(link.target);
    if (!source || !target) continue;
    const itemId = ITEM_TYPES.has(source.type) ? source.id : target.id;
    const hubId = itemId === source.id ? target.id : source.id;
    communityByItem.set(itemId, hubId);
  }

  // Si la relación primaria original no sobrevivió MIN_DEG, el hub con mayor
  // grado que sí quedó visible se vuelve la casa; id desempata de forma estable.
  for (const node of nodes) {
    if (!ITEM_TYPES.has(node.type) || communityByItem.has(node.id)) continue;
    const fallback = [...(hubsByItem.get(node.id) ?? [])].sort(
      (a, b) => (hubDegree.get(b) ?? 0) - (hubDegree.get(a) ?? 0) || a.localeCompare(b),
    )[0];
    if (fallback) communityByItem.set(node.id, fallback);
  }

  const anchors = new Set(communityByItem.values());
  const votesByHub = new Map<string, Map<string, number>>();
  for (const [itemId, hubs] of hubsByItem) {
    const community = communityByItem.get(itemId);
    if (!community) continue;
    for (const hubId of hubs) {
      const votes = votesByHub.get(hubId) ?? new Map<string, number>();
      votes.set(community, (votes.get(community) ?? 0) + 1);
      votesByHub.set(hubId, votes);
    }
  }

  const communityByHub = new Map<string, string>();
  for (const node of nodes) {
    if (ITEM_TYPES.has(node.type)) continue;
    if (anchors.has(node.id)) {
      communityByHub.set(node.id, node.id);
      continue;
    }
    const winner = [...(votesByHub.get(node.id) ?? new Map<string, number>())].sort(
      (a, b) => b[1] - a[1] || a[0].localeCompare(b[0]),
    )[0]?.[0];
    if (winner) communityByHub.set(node.id, winner);
  }

  const itemCountByMicro = new Map<string, number>();
  for (const community of communityByItem.values()) {
    itemCountByMicro.set(community, (itemCountByMicro.get(community) ?? 0) + 1);
  }

  // Afinidad real entre microcomunidades: sólo relaciones item↔hub. La malla
  // kNN es una decisión visual y no debe cambiar la semántica del atlas.
  const affinity = new Map<string, Map<string, number>>();
  const voteAffinity = (a: string, b: string) => {
    if (a === b) return;
    const rowA = affinity.get(a) ?? new Map<string, number>();
    const rowB = affinity.get(b) ?? new Map<string, number>();
    rowA.set(b, (rowA.get(b) ?? 0) + 1);
    rowB.set(a, (rowB.get(a) ?? 0) + 1);
    affinity.set(a, rowA);
    affinity.set(b, rowB);
  };
  for (const [itemId, hubs] of hubsByItem) {
    const itemCommunity = communityByItem.get(itemId);
    if (!itemCommunity) continue;
    for (const hubId of hubs) {
      const hubCommunity = communityByHub.get(hubId);
      if (hubCommunity) voteAffinity(itemCommunity, hubCommunity);
    }
  }

  const finalByMicro = new Map<string, string>();
  const labelByCommunity = new Map<string, string>();

  // Componentes de afinidad: los desconectados son satélites honestos. Dentro
  // de cada componente, los K hubs primarios más grandes funcionan como semillas
  // y el resto se propaga hacia ellas; así ningún mega-grupo absorbe todo.
  const pendingComponents = new Set([...anchors]);
  const components: string[][] = [];
  while (pendingComponents.size) {
    const start = [...pendingComponents].sort()[0];
    const stack = [start];
    const component: string[] = [];
    pendingComponents.delete(start);
    while (stack.length) {
      const current = stack.pop()!;
      component.push(current);
      for (const neighbor of affinity.get(current)?.keys() ?? []) {
        if (!pendingComponents.has(neighbor)) continue;
        pendingComponents.delete(neighbor);
        stack.push(neighbor);
      }
    }
    components.push(component.sort());
  }

  for (const component of components) {
    const seedCount = Math.max(1, Math.round(Math.sqrt(component.length)));
    const seeds = [...component]
      .sort(
        (a, b) =>
          (itemCountByMicro.get(b) ?? 0) - (itemCountByMicro.get(a) ?? 0) ||
          (hubDegree.get(b) ?? 0) - (hubDegree.get(a) ?? 0) ||
          a.localeCompare(b),
      )
      .slice(0, seedCount);
    const membersBySeed = new Map(seeds.map((seed) => [seed, new Set([seed])]));
    const unassigned = new Set(component.filter((micro) => !membersBySeed.has(micro)));

    while (unassigned.size) {
      const candidates: Array<{ micro: string; seed: string; weight: number; score: number }> = [];
      for (const micro of unassigned) {
        for (const [seed, members] of membersBySeed) {
          let weight = 0;
          for (const member of members) weight += affinity.get(micro)?.get(member) ?? 0;
          if (weight === 0) continue;
          const groupItems = [...members].reduce(
            (sum, member) => sum + (itemCountByMicro.get(member) ?? 0),
            0,
          );
          candidates.push({
            micro,
            seed,
            weight,
            score: weight / Math.sqrt(Math.max(1, (itemCountByMicro.get(micro) ?? 0) * groupItems)),
          });
        }
      }
      const best = candidates.sort(
        (a, b) =>
          b.score - a.score ||
          b.weight - a.weight ||
          (itemCountByMicro.get(b.micro) ?? 0) - (itemCountByMicro.get(a.micro) ?? 0) ||
          a.micro.localeCompare(b.micro) ||
          a.seed.localeCompare(b.seed),
      )[0];
      if (!best) {
        // Sólo puede ocurrir con una entrada inconsistente; conservar la isla es
        // preferible a inventar una relación semántica.
        const micro = [...unassigned].sort()[0];
        membersBySeed.set(micro, new Set([micro]));
        unassigned.delete(micro);
        continue;
      }
      membersBySeed.get(best.seed)!.add(best.micro);
      unassigned.delete(best.micro);
    }

    for (const [seed, members] of membersBySeed) {
      for (const member of members) finalByMicro.set(member, seed);
      labelByCommunity.set(seed, byId.get(seed)?.label ?? seed);
    }
  }

  return nodes.map((node) => {
    const micro = ITEM_TYPES.has(node.type)
      ? communityByItem.get(node.id)
      : communityByHub.get(node.id);
    if (!micro) return node;
    const community = finalByMicro.get(micro) ?? micro;
    return {
      ...node,
      community,
      communityLabel: labelByCommunity.get(community) ?? community,
    };
  });
}

/**
 * Empaca centroides en una espiral áurea. Ordenar por tamaño y rechazar
 * colisiones produce un archipiélago orgánico y estable, no un anillo perfecto.
 */
export function centrosDeComunidades(nodes: NodoConComunidad[]): Map<string, CentroComunidad> {
  const groups = new Map<string, { label: string; count: number }>();
  for (const node of nodes) {
    if (!node.community) continue;
    const group = groups.get(node.community) ?? {
      label: node.communityLabel ?? node.community,
      count: 0,
    };
    group.count += 1;
    groups.set(node.community, group);
  }

  const ordered = [...groups.entries()]
    .map(([id, group]) => ({
      id,
      ...group,
      radius: Math.max(42, Math.min(104, 30 + Math.sqrt(group.count) * 11)),
    }))
    .sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));

  const placed: CentroComunidad[] = [];
  for (const group of ordered) {
    if (placed.length === 0) {
      placed.push({ ...group, x: 0, y: 0 });
      continue;
    }

    let point = { x: 0, y: 0 };
    for (let step = 1; step < 6000; step++) {
      const distance = 12 * Math.sqrt(step);
      const angle = step * GOLDEN_ANGLE;
      const candidate = {
        x: Math.cos(angle) * distance * 1.18,
        y: Math.sin(angle) * distance * 0.9,
      };
      const free = placed.every((other) => {
        const dx = candidate.x - other.x;
        const dy = candidate.y - other.y;
        return Math.hypot(dx, dy) >= group.radius + other.radius + 28;
      });
      if (free) {
        point = candidate;
        break;
      }
    }
    placed.push({ ...group, ...point });
  }

  return new Map(placed.map((community) => [community.id, community]));
}
