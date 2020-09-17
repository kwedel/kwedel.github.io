var questdiv = d3.select('body').append('div')
    .attr('class', 'questtooltip')
    .attr('opacity', 0)


var qsvg = d3.select("#questsvg"),
    margin = {top: 60, right: 40, bottom: 60, left: 60},
    qwidth = qsvg.attr("width") - margin.left - margin.right,
    qheight = qsvg.attr("height") - margin.top - margin.bottom;

var qg = qsvg.append("g")
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')


d3.csv('questions.csv', qtype, function (error,data) {
    if (error) throw error;

    var xScale = d3.scaleLinear()
	.domain(d3.extent(data, d => d.consensus))
	.domain([0,1])
	.range([0,qwidth])

    var yScale = d3.scaleLinear()
	.domain(d3.extent(data, d => d.importance))
	.range([qheight,0])

    var colorScale = d3.scaleSequential(d3.interpolateRdYlGn)
	.domain([-1,1])

    var circles = qg.append('g').selectAll('circle')
	.data(data)
	.enter()
	.append('circle')
	.attr('cx', d => xScale(Math.abs(d.consensus)))
	.attr('cy', d => yScale(d.importance))
	.attr('r', 5)
	.attr('fill', d => colorScale(d.consensus))
	.attr('stroke','black')
	.on('mouseover', function(d){
	    questdiv.style('left', d3.event.pageX + 'px')
		.style('top', d3.event.pageY + 'px')
		.style('opacity',1)
		.html(`<strong>Spørgsmål ${d.index}</strong><br/> ${d.question}`)
	})
	.on('mouseout', function(){
	    questdiv.style('opacity',0)
	});

    // Axis
    qg.append('g')
	.attr('transform','translate(0,' + (qheight + 10) + ')')
	.call(d3.axisBottom(xScale).tickValues([0,0.1,0.2,0.3,0.4,0.5,0.6,0.7]))
	.select('.domain').remove();

    qg.append('g')
	.attr('transform','translate(' + -10 + ',0)')
	.call(d3.axisLeft(yScale))
	.select('.domain').remove();

    qg.append("text")
	.attr("text-anchor", "middle")
	.attr("x", xScale(0.35))
	.attr("y", qheight + 50)
	.text("Grad af konsenus");

    qg.append("text")
	.style("text-anchor", "middle")
	.attr('transform','rotate(-90)')
	.attr("x", -qheight/2)
	.attr("y", -50)
	.text("Vigtighed");


});


function qtype(d) {
    d.consensus = +d.consensus;
    d.importance = +d.importance
    d.question = String(d.question)
    return d;
}
