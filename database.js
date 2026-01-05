const Dagoba = {
    createGraph: function() {
        return {
            vertices: [],
            edges: [],
            vertexIndex: {}, 

            addVertex: function(name, x, y) {
                if (this.vertexIndex[name]) return this.vertexIndex[name];
                // Ensure coordinates are numbers or random
                const v = { 
                    name: name, 
                    _out: [], 
                    _in: [], 
                    x: x || Math.random() * 800, 
                    y: y || Math.random() * 500,
                    vx: 0,
                    vy: 0
                }; 
                this.vertices.push(v);
                this.vertexIndex[name] = v;
                return v;
            },

            addEdge: function(fromName, toName, label) {
                const from = this.vertexIndex[fromName];
                const to = this.vertexIndex[toName];
                if (!from || !to) return null;

                const edge = { from, to, label };
                from._out.push(edge); 
                to._in.push(edge);
                this.edges.push(edge);
            },

            v: function(name) {
                const startVertex = this.vertexIndex[name];
                const gremlin = { vertex: startVertex, history: [] };
                return new Query(this, [gremlin]);
            },

            save: function() {
                const data = {
                    V: this.vertices.map(v => {
                        const cleanV = { ...v };
                        delete cleanV._in;  
                        delete cleanV._out;
                        return cleanV;
                    }),
                    E: this.edges.map(e => ({
                        from: e.from.name,
                        to: e.to.name,
                        label: e.label
                    }))
                };
                localStorage.setItem('myGraphDB', JSON.stringify(data));
            },

            load: function() {
                const json = localStorage.getItem('myGraphDB');
                if (!json) return;
                const data = JSON.parse(json);
                this.vertices = [];
                this.edges = [];
                this.vertexIndex = {};
                data.V.forEach(v => {
                    const newV = this.addVertex(v.name, v.x, v.y);
                    Object.assign(newV, v); 
                });
                data.E.forEach(e => this.addEdge(e.from, e.to, e.label));
            }
        };
    }
};

class Query {
    constructor(graph, gremlins) {
        this.graph = graph;
        this.gremlins = gremlins; 
    }
    out() {
        let nextGremlins = [];
        this.gremlins.forEach(g => {
            g.vertex._out.forEach(edge => {
                nextGremlins.push({ vertex: edge.to, history: [...g.history, g.vertex.name] });
            });
        });
        this.gremlins = nextGremlins;
        return this;
    }
    in() {
        let nextGremlins = [];
        this.gremlins.forEach(g => {
            g.vertex._in.forEach(edge => {
                nextGremlins.push({ vertex: edge.from, history: [...g.history, g.vertex.name] });
            });
        });
        this.gremlins = nextGremlins;
        return this;
    }
    filter(predicate) {
        this.gremlins = this.gremlins.filter(g => predicate(g.vertex));
        return this;
    }
    run() {
        const results = this.gremlins.map(g => g.vertex.name);
        return [...new Set(results)];
    }
}
