// @TODO: YOUR CODE HERE!

// Define SVG area dimensions
var svgWidth = 960;
var svgHeight = 500;

// Define the chart's margins as an object
var margin = {
  top: 60,
  right: 60,
  bottom: 60,
  left: 60
};

// Define dimensions of the chart area
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Select body, append SVG area to it, and set its dimensions
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append a group area, then set its margins
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params for choosing each axis (set defaults)
var chosenXAxis = "poverty";
// var chosenYAxis = "obesity";


// function used for updating x-scale var upon click on axis label
function xScale(journalismData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(journalismData, d => d[chosenXAxis]),
        d3.max(journalismData, d => d[chosenXAxis])
      ])
      .range([0, chartWidth]);
  
    return xLinearScale;
  }

//   function yScale(journalismData, chosenYAxis) {
    // create scales
//     var yLinearScale = d3.scaleLinear()
//       .domain([d3.min(journalismData, d => d[chosenXAxis]),
//         d3.max(journalismData, d => d[chosenYAxis])
//       ])
//       .range([0, chartHeight]);
  
//     return yLinearScale;
//   }

  // function used for updating xAxis var upon click on axis label
function renderAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }

// function used for updating yAxis var upon click on axis label
// function renderAxes(newYScale, yAxis) {
//     var leftAxis = d3.axisLeft(newYScale);
  
//     yAxis.transition()
//       .duration(1000)
//       .call(leftAxis);
  
//     return yAxis;
//   }

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
 
    return circlesGroup;
  }

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    var label;
  
    if (chosenXAxis === "poverty") {
      label = "Poverty:";
    }
    else {
      label = "Age:";
    }
  
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>${label} ${d[chosenXAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }
// Load data from forcepoints.csv
d3.csv("assets/data/data.csv").then(function(journalismData, err) {
    if (err) throw err;
  // Print the forceData
  console.log(journalismData);

  // Format the date and cast the force value to a number
  journalismData.forEach(function(data) {
    data.poverty = +data.poverty;
    data.age = +data.age;
    data.obesity = +data.obesity;
    data.smokes = +data.smokes;
  });

  // xLinearScale function above csv import
  var xLinearScale = xScale(journalismData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(journalismData, d => d.obesity)])
    .range([chartHeight, 0]);

  // Create two new functions passing the scales in as arguments
  // These will be used to create the chart's axes
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

//   // Configure a line function which will plot the x and y coordinates using our scales
//   var drawLine = d3.line()
//     .x(data => xTimeScale(data.poverty))
//     .y(data => yLinearScale(data.age));

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(journalismData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.obesity))
    .attr("r", 20)
    .attr("fill", "red")
    .attr("opacity", ".5");

 // Create group for  2 x- axis labels
 var labelsGroup = chartGroup.append("g")
 .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

var povertyLabel = labelsGroup.append("text")
 .attr("x", 0)
 .attr("y", 20)
 .attr("value", "poverty") // value to grab for event listener
 .classed("active", true)
 .text("Poverty (%)");

var ageLabel = labelsGroup.append("text")
 .attr("x", 0)
 .attr("y", 40)
 .attr("value", "age") // value to grab for event listener
 .classed("inactive", true)
 .text("Age in years");

// append y axis
chartGroup.append("text")
 .attr("transform", "rotate(-90)")
 .attr("y", 0 - margin.left)
 .attr("x", 0 - (chartHeight / 2))
 .attr("dy", "1em")
 .classed("atext", true)
 .text("Obesity (%)");

// updateToolTip function above csv import
var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

// x axis labels event listener
labelsGroup.selectAll("text")
 .on("click", function() {
   // get value of selection
   var value = d3.select(this).attr("value");
   if (value !== chosenXAxis) {

     // replaces chosenXAxis with value
     chosenXAxis = value;

     // console.log(chosenXAxis)

     // functions here found above csv import
     // updates x scale for new data
     xLinearScale = xScale(journalismData, chosenXAxis);

     // updates x axis with transition
     xAxis = renderAxes(xLinearScale, xAxis);

     // updates circles with new x values
     circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

     // updates tooltips with new info
     circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

     // changes classes to change bold text
     if (chosenXAxis === "age") {
       ageLabel
         .classed("active", true)
         .classed("inactive", false);
       povertyLabel
         .classed("active", false)
         .classed("inactive", true);
     }
     else {
       ageLabel
         .classed("active", false)
         .classed("inactive", true);
       povertyLabel
         .classed("active", true)
         .classed("inactive", false);
     }
   }
 });
}).catch(function(error) {
console.log(error);
});
