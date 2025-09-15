// #region CONFIG

const width = 640;
const height = 800;
let previousNode = null;
const originalRadius = 3;
const hoverRadius = 10;



// #endregion

// #region INIT

// Load the correct data file

d3.csv("data/no_marketing_writing.csv").then(data => {

// #endregion

// #region STATE
    let nodes = [];
    data.forEach(d => {
        let newNode = {'category':d['Final label']};
        console.log(d['Final label']);
        //this starts as false because I have to use a function to update the nodes, they don't do it if the state is just reassigned. The function must run once on instantiation or color and targetY will not be assigned to begin.
        newNode.clusteredState = false;
        newNode.company = d['company_name'];
        newNode.title = d['title'];
        newNode.description = d['description'];

// #endregion

// #region LOGIC
        newNode.flipClustered = function(){

        newNode.clusteredState = !newNode.clusteredState;
        if (newNode.clusteredState === false){
            if (d['Final label'] =='Graphic Design'){
            newNode.fill='orange'
            newNode.targetY = height/2;
            }
            else if (d['Final label'] == 'Marketing'){
            newNode.fill='pink'
            newNode.targetY = height /2 +250;
            }
            else{
            newNode.fill = 'red'
            newNode.targetY = height/2 - 250;
            }
        }
        else {
            newNode.fill = 'gray';
            newNode.targetY = height/2;
        }
    };
        ;
        newNode.flipClustered();
        newNode.r = originalRadius;
        nodes.push(newNode);
        console.log(nodes);
    });

    let canvas = d3.select('#canvas-container')
        .append('canvas')
        .attr('width', width)
        .attr('height', height)
        .attr('id', 'my-canvas');

    const ctx = canvas.node().getContext('2d');

    const simulation = d3.forceSimulation(nodes) // Pass the `nodes` to the simulation

        // .force("center", d3.forceCenter(width/2, height / 2))
        .force("x", d3.forceX( width/2))
        .force("y", d3.forceY(d => d.targetY))


        .force("charge", d3.forceManyBody().strength())
        .force("collide", d3.forceCollide().radius(d => d.r + d.r/2)); // Adjusted radius for collision




    function draw(nodeArray) {
            // Clear the canvas on each frame
        ctx.clearRect(0, 0, width, height);

        //draw circles
        nodes.forEach(d => {
            ctx.beginPath();
            ctx.arc(d.x,d.y, d.r, 0, 2*Math.PI);
            ctx.fillStyle=d.fill;
            ctx.fill();
            ctx.closePath();
        });

    };

    simulation.on("tick", draw);

    canvas.on("mousemove",(event) =>{
        let m = {
            'x': d3.pointer(event)[0],
            'y': d3.pointer(event)[1]
        };
        // console.log(`The mouse is at x ${m.x}, y ${m.y}`)
        selectedNode = simulation.find(m.x, m.y, 8);

        let tip = d3.select('.tooltip');
        if (selectedNode) {
            console.log(selectedNode);
            // display tooltip. .tooltip already styled in style head

            tip.style('top', event.pageY+'px')
                .style('left', event.pageX+'px')
                .style('opacity',1)
                .html(`<span style="font-size: 14px;"><strong>${selectedNode.category}</strong></span>
                <span><strong>Company:</strong> ${selectedNode.company}</span>
                <span><strong> Position:</strong> ${selectedNode.title}</span>`);
            selectedNode.r = hoverRadius;
            // If we moved to a new node, shrink the old one
            if (previousNode && selectedNode !== previousNode) {
                previousNode.r = originalRadius;
                    }
            previousNode = selectedNode
        }
        else {
            tip.style('opacity', 0);

            if(previousNode){
            previousNode.r = originalRadius;
            previousNode = null;
            }
            
        };
        draw();

    });

  

    d3.select('#my-button').on('click', () => {
        nodes.forEach(d => {

        d.flipClustered();

        });

        // 3. Re-apply the force to make the simulation aware of the new targets
        //    and increase its strength to make the transition clear.
        simulation.force("y", d3.forceY(d => d.targetY));



        simulation.alpha(.5).restart();
    });

    window.flipNodes = function() {
        nodes.forEach(d => d.flipClustered());

        simulation.force("y", d3.forceY(d => d.targetY));
        simulation.alpha(.5).restart();
    };
});

;
