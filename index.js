//On window load

var vis;
var centered;

window.onload = function() {
    var coords = [0, 100, 200, 300, 400];

    centered = false;

    vis = d3.select("#vis");

    console.log(vis)

    var initcircles = vis.selectAll("circle")
    .data(coords);

    initcircles.enter()
    .append("circle")
    .attr("class", "red")
    .attr("cx", function(d) {
        return d;
    })
    .attr("cy", function(d) {
        return d;
    })
    .attr("r", "25");
}

function moveCircles() {

	var circles = vis.selectAll("circle")

  if (centered) {
    circles.transition()
      .duration(1000)
      .attr('cx', function(d) {
        return d;
      });

    centered = false;
  } else {
    circles.transition()
      .duration(1000)
      .attr('cx', 200);

    centered = true;
  }
}
