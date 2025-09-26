// Load data before calling any vizualization. initViz is where you will call everything that needs this data
let width, height, ctx;
let nodes = [];
let simulation;
let originalRadius;
let canvas;
let orientationMode='horizontal';
let categoryCenters = {
    categories: {
        graphicDesign: {
            name:'Graphic Design',
            targetX: 0,
            targetY: 0
        },
        ux: {
            name:"UX",
            targetX: 0,
            targetY: 0
        },
        marketing: {
            name:'Marketing',
            targetX: 0,
            targetY: 0
        }
    },
    updateCategoryCenters: function(){
        this.categories.marketing.targetX = nodes.filter((node)=>node.category=='Marketing')[0].targetX;
        this.categories.marketing.targetY = nodes.filter((node)=>node.category=='Marketing')[0].targetY;

        this.categories.graphicDesign.targetX = nodes.filter((node)=>node.category=='Graphic Design')[0].targetX;
        this.categories.graphicDesign.targetY = nodes.filter((node)=>node.category=='Graphic Design')[0].targetY;

        this.categories.ux.targetX = nodes.filter((node)=>node.category=='Product and UX')[0].targetX;
        this.categories.ux.targetY = nodes.filter((node)=>node.category=='Product and UX')[0].targetY;
        
    },

    labelDisplayer: function(flag){
        if(flag=='on'){
           for(let categoryName in this.categories){
                const category = this.categories[categoryName];
                const label = d3.select('#canvas-container')
                    .append("div")
                    .classed("cat-labels", true);
                label.style("top", `${category.targetY - 200}px`)
                    .style("left", `${category.targetX}px`)
                    .style("z-index", "1000")
                    .html(`${category.name}`);
            };
        }
            else {
                d3.selectAll('.cat-labels').remove();
            }
           

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
    canvas.on('mousemove', (event) => showJobInfo.hoverNode(event));

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
                simulation.force("y", d3.forceY(d => d.targetY));
                simulation.alpha(.5).restart();
                break;

            case 'step2':
                let offset= .25;
                if (orientationMode=='portrait'){
                    offset = .4;
                }
                if (orientationMode == 'horizontal'){
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
                } 
                else{
                        nodeArray.forEach(node =>{
                        if (node.category ==='Graphic Design'){
                        node.fill='orange'
                        node.offsetY = 0;
                        }
                        else if (node.category === 'Marketing'){
                        node.fill='pink'
                        node.offsetY = height * offset;
                        }
                        else{
                        node.fill = 'red'
                        node.offsetY = -height * offset;
                        }
                        node.updateTarget(width,height);
                        })
                    categoryCenters.updateCategoryCenters();
                    console.log(`stateChanger case ${desiredState}`);

                    simulation.force("y", d3.forceY(d => d.targetY));


                }

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

let showJobInfo = {
    tooltip: d3.select('#tooltip'),
    selectedNode: null,
    previousNode: null, // Move previousNode into this object
    hoverNode: function(event){
        let currentStep = d3.select('.is-active');
        if(currentStep.attr('data-step')!='3'){
            let m = {
                'x': d3.pointer(event)[0],
                'y': d3.pointer(event)[1]
            };
            this.selectedNode = simulation.find(m.x, m.y, 8);
            this.showTip(this.selectedNode);
            draw(nodes);
        }
    },
    showTip: function (selectedNode) {
        if(this.previousNode){
            this.previousNode.radius = originalRadius;
        }

        if(selectedNode){
            this.tooltip.style('top', selectedNode.y+'px')
            .style('left', selectedNode.x+'px')
            .style('opacity', 1)
            .html(
                `<span><strong>${selectedNode.category}</strong></span>
                <span><strong>Company</strong><br>${selectedNode.company}</span>
                <span><strong> Position<br></strong>${selectedNode.title}</span>`);

            let hoverRadius = originalRadius*2;
            selectedNode.radius = hoverRadius;
            this.previousNode = selectedNode;
        }
        else {
            this.tooltip.style('opacity', 0);
            this.previousNode = null;
        }
        
        draw(nodes);
    }

}

function resizeCanvas() {
    const container = document.getElementById('canvas-container');
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    width = w;
    height = h;
    canvas.attr('width', w).attr('height', h);
    if (width<1400){
        orientationMode = 'vertical';
    }
    else {
        orientationMode = 'horizontal';
    }
    nodes.forEach(node => node.updateTarget(width,height));
    simulation.force("x", d3.forceX(d => d.targetX));
    simulation.force("y", d3.forceY(d => d.targetY));
    simulation.alpha(0.5).restart();
    draw(nodes);
    categoryCenters.updateCategoryCenters();
}