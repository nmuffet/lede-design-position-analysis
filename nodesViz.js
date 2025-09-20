// Load data before calling any vizualization. initViz is where you will call everything that needs this data
let width, height, ctx;
let nodes = [];
let simulation;
let previousNode;
let originalRadius;
let canvas;
let categoryCenters = {
    graphicDesign: {
        targetX: 0,
        targetY: 0
    },
    ux: {
        targetX: 0,
        targetY: 0
    },
    marketing: {
        targetX: 0,
        targetY: 0
    },
    updateCategoryCenters: function(){
        this.marketing.targetX = nodes.filter((node)=>node.category=='Marketing')[0].targetX;
        this.marketing.targetY = nodes.filter((node)=>node.category=='Marketing')[0].targetY;

        this.graphicDesign.targetX = nodes.filter((node)=>node.category=='Graphic Design')[0].targetX;
        this.graphicDesign.targetY = nodes.filter((node)=>node.category=='Graphic Design')[0].targetY;

        this.ux.targetX = nodes.filter((node)=>node.category=='Product and UX')[0].targetX;
        this.ux.targetY = nodes.filter((node)=>node.category=='Product and UX')[0].targetY;
        
    }
};

d3.csv('data/no_marketing_writing.csv').then(initViz);



function initViz(data){
    console.log('initViz running');

    width = 640;
    height = 800;
    originalRadius = 4;


    
    canvas = d3.select('#canvas-container')
        .append('canvas')
        .attr('width', width)
        .attr('height', height)
        .attr('id', 'my-canvas');
    ctx = canvas.node().getContext('2d');

    window.addEventListener('resize', resizeCanvas);
    
    
    
   
    console.log('creating nodes');
    console.log(nodes);
    data.forEach(d=>nodes.push(createNode(d)));

    
    stateChanger('step1',nodes);

    
    console.log('defining simulation');
    simulation = createSimulation(nodes);

    resizeCanvas();


    console.log(nodes);

    console.log('adding event listeners');
    canvas.on('mousemove',hoverNode);

    simulation.on("tick", ()=>draw(nodes));
}

function createNode(d) {
    let newNode = {
        category:d['Final label'],
    
        //this starts as false because I have to use a function to update the nodes, they don't do it if the state is just reassigned. The function must run once on instantiation or color and targetY will not be assigned to begin.

        //formation will be used to match stat
        state: null,
        company: d['company_name'],
        title: d['title'],
        description: d['description'],
        fill: 'gray',
        targetX: width/2,
        targetY: height/2,
        radius: originalRadius,
        offsetX: 0,
        offsetY: 0,
        updateTarget: function(currentWidth,currentHeight) {
            this.targetX = (currentWidth/2) + this.offsetX;
            this.targetY = (currentHeight/2) + this.offsetY;
        }
    }
    return newNode;
}

function stateChanger(desiredState, nodeArray){

    if(simulation){
        switch(desiredState){
            case 'step1':
                nodeArray.forEach(node => {
                    node.state = 'start';
                    node.targetX=width/2;
                    node.targetY=height/2;
                    node.fill='gray';
                });
                console.log(`stateChanger case ${desiredState}`);
                simulation.force("x", d3.forceX(d => d.targetX));
                simulation.alpha(.5).restart();
                break;

            case 'step2':
                const offset= .2;
                nodeArray.forEach(node =>{
                    if (node.category ==='Graphic Design'){
                    node.fill='orange'
                    node.offsetX = 0;
                    }
                    else if (node.category === 'Marketing'){
                    node.fill='pink'
                    node.offsetX = width * offset;
                    }
                    else{
                    node.fill = 'red'
                    node.offsetX = -width * offset;
                    }
                    node.updateTarget(width,height);
                })
                categoryCenters.updateCategoryCenters();
                console.log(`stateChanger case ${desiredState}`);

                simulation.force("x", d3.forceX(d => d.targetX));

                simulation.alpha(.5).restart();
                break;
            default:
                break;
            


        }
    }
}

function createSimulation(nodeArray){
    return d3.forceSimulation(nodeArray)
        .force("x", d3.forceX(d=> d.targetX).strength(0.1))
        .force("y", d3.forceY(d=>d.targetY).strength(0.1))
        .force("collision", d3.forceCollide().radius(d => d.radius + 2));
}

function draw(nodeArray){
    console.log('drawing');
     ctx.clearRect(0, 0, width, height);

    //draw circles
    nodeArray.forEach(d => {
        ctx.beginPath();
        ctx.arc(d.x,d.y, d.radius, 0, 2*Math.PI);
        ctx.fillStyle=d.fill;
        ctx.fill();
        ctx.closePath();
    });

}

function hoverNode(event){
    let tooltip = d3.select('#tooltip');
    
    let m = {
            'x': d3.pointer(event)[0],
            'y': d3.pointer(event)[1]
        };
        // console.log(`The mouse is at x ${m.x}, y ${m.y}`)
        let selectedNode = simulation.find(m.x, m.y, 8);


    function showTip(selectedNode) {
        if(selectedNode){
            tooltip.style('top', selectedNode.y+'px')
            .style('left', selectedNode.x+'px')
            .style('opacity', 1)
            .html(
                `<span style="font-size: 14px;"><strong>${selectedNode.category}</strong></span>
                <span><strong>Company:</strong> ${selectedNode.company}</span>
                <span><strong> Position:</strong> ${selectedNode.title}</span>`);

            let hoverRadius = originalRadius*2;
            selectedNode.radius = hoverRadius;

            // If we moved to a new node, shrink the old one
            if (previousNode && selectedNode !== previousNode) {
                previousNode.radius = originalRadius;
                }
            previousNode = selectedNode
        }
        else {
            tooltip.style('opacity', 0);

            if(previousNode){
            previousNode.radius = originalRadius;
            previousNode = null;
            }
            
        };
    }

    showTip(selectedNode);
    draw(nodes);

}

function resizeCanvas() {
    const container = document.getElementById('canvas-container');
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    canvas.attr('width', w).attr('height', h);
    width = w;
    height = h;
    nodes.forEach(node => node.updateTarget(width,height));
    simulation.force("x", d3.forceX(d => d.targetX));
    simulation.force("y", d3.forceY(d => d.targetY));
    simulation.alpha(0.5).restart();
    draw(nodes);
}