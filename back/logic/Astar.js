// Définition de la classe Nœud pour représenter chaque case de la grille
class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.g = Infinity; // Coût réel depuis le départ
        this.h = 0;        // Coût estimé jusqu'à l'arrivée
        this.parent = null;
    }

    // Méthode pour comparer les nœuds en fonction de leur coût total (g + h)
    compareTo(other) {
        return (this.g + this.h) - (other.g + other.h);
    }
}

// Fonction pour calculer la distance de Manhattan entre deux nœuds
function manhattanDistance(node1, node2) {
    return Math.abs(node1.x - node2.x) + Math.abs(node1.y - node2.y);
}

// Algorithme A*
function astar(grid, start, end) {
    const openSet = [];
    const closedSet = new Set();

    openSet.push(start);
    start.g = 0;
    start.h = manhattanDistance(start, end);

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.compareTo(b));
        const current = openSet.shift();

        if (current === end) {
            const path = [];
            let node = current;
            while (node !== null) {
                path.unshift([node.x, node.y]);
                node = node.parent;
            }
            return path;
        }

        closedSet.add(current);

        const neighbors = [
            { dx: 2, dy: 0 },
            { dx: -2, dy: 0 },
            { dx: 0, dy: 2 },
            { dx: 0, dy: -2 }
        ];

        for (const { dx, dy } of neighbors) {
            const neighborX = current.x + dx;
            const neighborY = current.y + dy;

            if (neighborX >= 0 && neighborX < grid.length && neighborY >= 0 && neighborY < grid[0].length && grid[neighborX][neighborY] !== "wall") {
                const neighbor = new Node(neighborX, neighborY);
                if (closedSet.has(neighbor)) {
                    continue;
                }

                const tentativeG = current.g + 2; // Coût réel

                if (tentativeG < neighbor.g) {
                    neighbor.parent = current;
                    neighbor.g = tentativeG;
                    neighbor.h = manhattanDistance(neighbor, end);
                    if (!openSet.some(node => node.x === neighbor.x && node.y === neighbor.y)) {
                        openSet.push(neighbor);
                    }
                }
            }
        }
    }

    return null;
}

