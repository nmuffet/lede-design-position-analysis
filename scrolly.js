// using d3 for convenience
var main = d3.select("main");
var scrolly = main.select("#scrolly");
var figure = scrolly.select("figure");
var article = scrolly.select("article");
var step = article.selectAll(".step");

// initialize the scrollama
var scroller = scrollama();

// generic window resize listener event
function handleResize() {
    // 1. update height of step elements
    // var stepH = Math.floor(window.innerHeight * 0.75);
    // step.style("height", stepH + "px");

    var figureHeight = window.innerHeight;
    // var figureMarginTop = (window.innerHeight - figureHeight) / 2;

    figure
        .style("height", figureHeight + "px")
        // .style("top", figureMarginTop + "px")
        ;

    // 3. tell scrollama to update new element dimensions
    scroller.resize();
}

// scrollama event handlers
function handleStepEnter(response) {
    console.log(response);
    // response = { element, direction, index }

    // add color to current step only
    step.classed("is-active", function (d, i) {
        return i === response.index;
    });

    // update graphic based on step
    figure.select("p").text(response.index + 1);

    const stepValue = response.element.dataset.step;
    console.log(`stepvalue is ${stepValue}`);

    if ((stepValue == 1) & (response.direction=='up'))
        {console.log('should trigger window.flipNodes()');
        stateChanger('step1', nodes);
        categoryCenters.labelDisplayer('off');
        }       

    if (stepValue == 2)
        {console.log('should trigger window.flipNodes()');
        stateChanger('step2', nodes);
        categoryCenters.labelDisplayer('on');
        }

    if (stepValue == 3)
    {
        showJobInfo.showTip(nodes.filter((node)=>node.category=='Marketing')[25]);
    }
    if (stepValue == 4)
    {
        showJobInfo.showTip(nodes.filter((node)=>node.index==266)[0]);
    }
    if (stepValue == 5)
    {
        showJobInfo.showTip(nodes.filter((node)=>node.index==930)[0]);
    }
    if (stepValue == 6)
    {
        waffleChart.buildChart(nodes);
    }
}

function init() {

    // 1. force a resize on load to ensure proper dimensions are sent to scrollama
    handleResize();

    // 2. setup the scroller passing options
    // 		this will also initialize trigger observations
    // 3. bind scrollama event handlers (this can be chained like below)
    scroller
        .setup({
            step: "#scrolly article .step",
            offset: 0.80,
            debug: false
        })
        .onStepEnter(handleStepEnter);
}

init();


