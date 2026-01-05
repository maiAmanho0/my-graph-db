const mySocialNetwork = Dagoba.createGraph();

// Initial Data
mySocialNetwork.addVertex("Alice");
mySocialNetwork.addVertex("Bob");
mySocialNetwork.addVertex("Charlie");
mySocialNetwork.addEdge("Alice", "Bob", "friends");
mySocialNetwork.addEdge("Bob", "Charlie", "friends");

let camera = { x: 0, y: 0 };
let targetNode = null; 
let selectedNode = null; // For connecting nodes

const canvas = document.getElementById('graphCanvas');
const repulsion = 5000; 
const attraction = 0.05; 
const damping = 0.9;    

// INTERACTION LOGIC
canvas.addEventListener('mousedown', function(event) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (event.clientX - rect.left) - camera.x;
    const mouseY = (event.clientY - rect.top) - camera.y;

    // Check if we clicked a node
    let clickedNode = mySocialNetwork.vertices.find(v => {
        let dx = v.x - mouseX;
        let dy = v.y - mouseY;
        return Math.sqrt(dx*dx + dy*dy) < 20;
    });

    if (clickedNode) {
        if (selectedNode && selectedNode !== clickedNode) {
            // If we already had one selected, connect them!
            mySocialNetwork.addEdge(selectedNode.name, clickedNode.name, "friends");
            selectedNode = null;
        } else {
            selectedNode = clickedNode;
            targetNode = clickedNode; // Camera follows
        }
    } else {
        // Clicked empty space: Create new node
        const name = prompt("Enter name:");
        if (name) mySocialNetwork.addVertex(name, mouseX, mouseY);
        selectedNode = null;
    }
});

function searchNode() {
    const name = document.getElementById('searchInput').value;
    const node = mySocialNetwork.vertexIndex[name];
    if (node) targetNode = node;
}

function updatePhysics() {
    const nodes = mySocialNetwork.vertices;
    const edges = mySocialNetwork.edges;

    nodes.forEach(v1 => {
        nodes.forEach(v2 => {
            if (v1 === v2) return;
            let dx = v1.x - v2.x;
            let dy = v1.y - v2.y;
            let dist = Math.sqrt(dx*dx + dy*dy) || 1;
            let force = repulsion / (dist * dist);
            v1.vx += (dx / dist) * force;
            v1.vy += (dy / dist) * force;
        });
    });

    edges.forEach(e => {
        let dx = e.to.x - e.from.x;
        let dy = e.to.y - e.from.y;
        let dist = Math.sqrt(dx*dx + dy*dy) || 1;
        let force = dist * attraction;
        e.from.vx += (dx / dist) * force;
        e.from.vy += (dy / dist) * force;
        e.to.vx -= (dx / dist) * force;
        e.to.vy -= (dy / dist) * force;
    });

    nodes.forEach(v => {
        v.vx *= damping; v.vy *= damping;
        v.x += v.vx; v.y += v.vy;
    });
}

function visualize() {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    if (targetNode) {
        camera.x += ((canvas.width/2 - targetNode.x) - camera.x) * 0.05;
        camera.y += ((canvas.height/2 - targetNode.y) - camera.y) * 0.05;
    }

    ctx.translate(camera.x, camera.y);

    mySocialNetwork.edges.forEach(e => {
        ctx.strokeStyle = "#ccc";
        ctx.beginPath();
        ctx.moveTo(e.from.x, e.from.y);
        ctx.lineTo(e.to.x, e.to.y);
        ctx.stroke();
    });

    mySocialNetwork.vertices.forEach(v => {
        // Color: Gold if searching, Green if selected to connect, Blue otherwise
        ctx.fillStyle = (v === targetNode) ? "gold" : (v === selectedNode ? "#2ecc71" : "#4444ff");
        ctx.beginPath();
        ctx.arc(v.x, v.y, 20, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.font = "12px Arial";
        ctx.fillText(v.name, v.x, v.y + 35);
    });

    ctx.restore();
}

function renderLoop() {
    updatePhysics();
    visualize();
    requestAnimationFrame(renderLoop);
}
renderLoop();
