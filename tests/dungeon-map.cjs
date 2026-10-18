const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync('content/shared/stages/ash-corridor.js', 'utf8'), context);
const generate = context.window.GameContent.generateDungeonMap;
let seed = 42;
const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 4294967296);
const counts = {}, branches = {};
let previous;
for (let run = 0; run < 1000; run++) {
  const map = generate(random);
  assert.equal(map.floors.length, 16);
  assert.ok([3, 4].includes(map.floors[0].length));
  assert.ok(map.floors[0].every(node => node.nodeId === 'node_ash_battle'), 'Floor 1 must be normal battles');
  assert.ok(map.floors[14].every(node => node.nodeId === 'node_ash_rest'), 'Floor 15 must be rest sites');
  assert.equal(map.floors[15].length, 1);
  assert.equal(map.floors[15][0].nodeId, 'node_ash_final_boss');
  const reachable = new Set(map.floors[0].map(n => n.id));
  for (const row of map.floors.slice(0, -1)) {
    const edges = row.flatMap(source => source.nextIds.map(id => ({ source, target: map.nodes[id] })));
    for (const a of edges) for (const b of edges) {
      assert.ok((a.source.x - b.source.x) * (a.target.x - b.target.x) >= 0,
        'Routes must not cross between floors');
    }
  }
  for (const row of map.floors) for (const node of row) {
    assert.ok(reachable.has(node.id), 'Every node must be reachable');
    assert.equal(map.nodes[node.id], node);
    if (node.floor === 16) { assert.equal(node.nextIds.length, 0); continue; }
    assert.ok(node.nextIds.length >= 1 && node.nextIds.length <= 3);
    assert.equal(new Set(node.nextIds).size, node.nextIds.length);
    branches[node.nextIds.length] = (branches[node.nextIds.length] || 0) + 1;
    if (node.floor >= 2 && node.floor <= 14) counts[node.nodeId] = (counts[node.nodeId] || 0) + 1;
    for (const id of node.nextIds) {
      assert.equal(map.nodes[id].floor, node.floor + 1);
      reachable.add(id);
    }
  }
  const serialized = JSON.stringify(map);
  assert.notEqual(serialized, previous);
  previous = serialized;
}
const total = Object.values(counts).reduce((a,b) => a+b,0);
for (const [id, expected] of [['node_ash_battle',.325],['node_ash_event',.325],['node_ash_elite',.15],['node_ash_shop',.1],['node_ash_rest',.1]]) {
  assert.ok(Math.abs(counts[id]/total-expected)<.015, id+' probability');
}
assert.ok(branches[1] > branches[2] && branches[2] > branches[3]);
console.log('1000 generated maps passed: no crossings, reachability, floors, branches, boss convergence, randomness and weighted frequencies.', counts, branches);
