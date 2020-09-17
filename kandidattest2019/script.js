const partiledere = ['Lars Løkke Rasmussen',
                'Pernille Skipper',
               'Anders Samuelsen',
               'Morten Østergaard',
               'Mette Frederiksen',
              'Klaus Riskær Pedersen',
              'Kristian Thulesen Dahl',
              'Søren Pape Poulsen',
              'Pernille Vermund',
              'Stig Grenov',
              'Uffe Elbæk',
              'Pia Olsen Dyhr',
		     'Rasmus Paludan'];




    	// SVG
var svg = d3.select("#mainsvg"),
    margin = {top: 60, right: 40, bottom: 60, left: 40},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

var g = svg.append("g")
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

svg.on('mouseover', function(){
    g.selectAll(".annotation-group")
	.transition()
	.duration(200)
	.style("opacity",0)
})
    .on('mouseout', function(){
	g.selectAll(".annotation-group")
	    .transition()
	    .duration(200)
	    .style("opacity",1)
    })

var tipcontainer = d3.select('body').append('div').attr('class','tipcontainer')
var tooltip = tipcontainer.append('div').attr('class','tooltip')

tooltip.html('<span id="partiSpan"></span> <br> <span id="navnSpan"></span> <br> <span id="kredsSpan"></span>')
    .style('visibility','hidden')

d3.csv('data.csv', type, function (error,data) {
    if (error) throw error;
    // Scales
    var colorScale = d3.scaleOrdinal()
	.domain(['B', 'Ø', 'F', 'O', 'I', 'S', 'C', 'Å', 'K', 'E', 'V', 'D', 'P', 'UP'])
	.range(['#FF69B4','#712981','#FF0000','#F8CE2F','#46ACD2','#C8112E','#0F7E40','#78B637','#ED7843','#528583','#0B5B98','#538EA8','#000000','#CCCCCC'])

    var partinavn = d3.scaleOrdinal()
	.domain(colorScale.domain())
	.range(['RV','EL','SF','DF','LA','S','K','ALT','KD','KRP','V','NB','SK','UP'])
	.range(['Radikale Venstre','Enhedslisten','Socialistisk Folkeparti','Dansk Folkeparti','Liberal Alliance','Socialdemokratiet','Konservative','Alternativet','Kristendemokraterne','Klaus Riskær Pedersen','Venstre','Nye Borgerlige','Stram Kurs','Uden for partierne'])
    
    var xScale = d3.scaleLinear()
      .domain(d3.extent(data, d => d.x_tsne))
    .range([0,width])
    var yScale = d3.scaleLinear()
	.domain(d3.extent(data, d => d.y_tsne))
	.range([height,0])
    var xpcaScale = d3.scaleLinear()
	.domain(d3.extent(data, d => d.x_pca))
	.range([0,width])
    var ypcaScale = d3.scaleLinear()
	.domain(d3.extent(data, d => d.y_pca))
	.range([height,0])
    var y2pcaScale = d3.scaleLinear()
	.domain(d3.extent(data, d => d.y2_pca))
	.range([height,0])
    

    // Circles
    var circles = g.append('g').selectAll('circle')    
	.data(data)
	.enter()
	.append('circle')
	.attr('cx',d => xScale(d.x))
	.attr('cy',d => yScale(d.y))
	.attr('r', d => partiledere.includes(d.navn) ? 10 : 5)
	.attr('stroke','white')
	.attr('stroke-width',1)
	.attr('fill',d => colorScale(d.symbol))
	.on('mouseover', function (d) {
            d3.select(this).transition()
		.duration(100)
		.attr('stroke','black')
	    // Tooltip
	    var matrix = this.getScreenCTM()
                .translate(+this.getAttribute("cx"),
                         +this.getAttribute("cy"));
	    tooltip.style('visibility','visible')
//		.style("left", (d3.event.pageX - 105) + "px")
	    //		.style("top", (d3.event.pageY +15) + "px")
	    tipcontainer.style("left", 
                   (window.pageXOffset + matrix.e + 2) + "px")
            .style("top",
                   (window.pageYOffset + matrix.f - this.getAttribute('r')) + "px")
	    tooltip.select('#partiSpan').text(partinavn(d.symbol))
	    tooltip.select('#navnSpan').text(d.navn)
	    tooltip.select('#kredsSpan').text(d.storkreds)
	})
      .on('mouseout', function () {
          d3.select(this)
              .transition()
              .duration(100)
              .attr('stroke','white')
	  tooltip.style('visibility','hidden')
      })
    
    var groupScale = d3.scalePoint()
	.domain(['Ø','F','Å','B','S','K','C','V','O','I','D'])
	.range([0,width])
	.padding(0)

    function resetSimPos(){
	data.forEach(function(d) {
	    d.x = xScale(d.x_tsne)
	    d.y = yScale(d.y_tsne)
	})
    }
    
    resetSimPos()
    var simulation = d3.forceSimulation(data)
	.force("fx", d3.forceX(d => groupScale(d.kmeans)).strength(0.1))
	.force("fy", d3.forceY(height / 2).strength(0.03))
	.force("collide", d3.forceCollide(d => partiledere.includes(d.navn) ? 10 : 5))
	.on('tick',ticked)
	.stop();


    function ticked(){
	circles.attr('cx',d => d.x)
	    .attr('cy',d => d.y)
    }

// Add buttons
    
    var topdiv = d3.select("#controldiv")

    topdiv.append("button")
	.attr('id','PKbutton')
        .text("Politisk kort")
        .on("click",function(){
	    mapping = mapdropdown.property('value');
	    g.selectAll('.annotation-group').style('display','none');
	    simulation.stop()
	    circles.transition().duration(1000)
		.attr('cx', function(d) {if (mapping == 'PCA') return xpcaScale(d.x_pca);
					 else if (mapping == 'PCA2') return xpcaScale(d.x_pca);
					 else return xScale(d.x_tsne)})
	    	.attr('cy', function(d) {if (mapping == 'PCA') return ypcaScale(d.y_pca);
					 else if (mapping == 'PCA2') return y2pcaScale(d.y2_pca) ;
					 else return yScale(d.y_tsne)})

	    if (mapping == 't-SNE')
	    {g.selectAll('.annotation-group')
	     .style('display','')};})
       
       topdiv.append("button")
       .text("Gruppér kandidater")
       .on("click",function(){
	   resetSimPos()
	   simulation.alpha(1)
	   simulation.restart()
	   g.selectAll('.annotation-group')
	       .style('display','none')})

    const kredse = ['Alle kredse','Bornholms Storkreds',
 'Fyns Storkreds',
 'Københavns Omegns Storkreds',
 'Københavns Storkreds',
 'Nordjyllands Storkreds',
 'Nordsjællands Storkreds',
 'Sjællands Storkreds',
 'Sydjyllands Storkreds',
 'Vestjyllands Storkreds',
 'Østjyllands Storkreds']
    
    var dropdown = topdiv.append('select')
    dropdown.selectAll('myOptions')
 	.data(kredse)
	.enter()
	.append('option')
	.text(function (d) { return d; })
	.attr("value", function (d) { return d; })

    function hidekreds(kreds) {
	if (kreds == 'Alle kredse'){
	    circles.style('opacity',1)
		.style('pointer-events','all')}
	else{
	    circles.filter(d => d.storkreds != kreds )
		.transition()
		.duration(300)
		.style('opacity',0.2)
		.style('pointer-events','none')
	    circles.filter(d => d.storkreds == kreds)
		.transition()
		.duration(300)
		.style('opacity',1)
		.style('pointer-events','all')}
    }
    
    dropdown.on("change", function(d) {
	var selectedOption = d3.select(this).property("value")

	hidekreds(selectedOption)
    })

    topdiv.append('text').text(' Mapping:')
    
    var mapdropdown = topdiv.append('select')
    mapdropdown.attr('id', 'mapdropdown')
    mapdropdown.append('option')
	.text('t-SNE')
	.attr('value', 't-SNE')
    mapdropdown.append('option')
	.text('PCA 1,2')
    	.attr('value', 'PCA')
    mapdropdown.append('option')
	.text('PCA 1,3')
    	.attr('value', 'PCA2')
    mapdropdown.on('change', function(){document.getElementById('PKbutton').click()});

//! Add buttons

// Add annotations    
const annotype = d3.annotationXYThreshold

    const annotations = [
	{
	    note: {
		label: "Socialdemokratiet"
	    },
	    x: 356,
	    y: 318,
	    dx: 40,
	    dy: 40,
	    color: colorScale('S')
	},
	{
	    note: {
		label: "Enhedslisten"
	    },
	    x: 48,
	    y: 342,
	    dx: -7,
	    dy: 15,
	    color: colorScale('Ø')
	},
	{
	    note: {
		label: "Socialistisk Folkeparti"
	    },
	    x: 151,
	    y: 307,
	    dx: 41,
	    dy: 67,
	    color: colorScale('F')
	},
    	{
	    note: {
		label: "Alternativet"
	    },
	    x: 83,
	    y: 94,
	    dx: -20,
	    dy: -40,
	    color: colorScale('Å')
	},
    	{
	    note: {
		label: "Radikale Venstre"
	    },
	    x: 253,
	    y: 97,
	    dx: 25,
	    dy: -63,
	    color: colorScale('B')
	},
    	{
	    note: {
		label: "Kristendemokraterne"
	    },
	    x: 356,
	    y: 103,
	    dx: 9,
	    dy: -38,
	    color: colorScale('K')
	},
    	{
	    note: {
		label: "Klaus Riskær Pedersen"
	    },
	    x: 322,
	    y: 197,
	    dx: 68,
	    dy: 14,
	    color: colorScale('E')
	},
    	{
	    note: {
		label: "Konservative"
	    },
	    x: 573,
	    y: 142,
	    dx: -20,
	    dy: -40,
	    color: colorScale('C')
	},
    	{
	    note: {
		label: "Venstre"
	    },
	    x: 600,
	    y: 258,
	    dx: -20,
	    dy: 40,
	    color: colorScale('V')
	},
    	{
	    note: {
		label: "Dansk Folkeparti"
	    },
	    x: 715,
	    y: 376,
	    dx: -39,
	    dy: 27,
	    color: colorScale('O')
	},
    	{
	    note: {
		label: "Nye Borgerlige"
	    },
	    x: 893,
	    y: 162,
	    dx: -6,
	    dy: -30,
	    color: colorScale('D')
	},
    	{
	    note: {
		label: "Liberal Alliance"
	    },
	    x: 736,
	    y: 11,
	    dx: -28,
	    dy: -24,
	    color: colorScale('I')
	},
    	{
	    note: {
		label: "Stram Kurs"
	    },
	    x: 845,
	    y: 248,
	    dx: 10,
	    dy: 58,
	    color: colorScale('P')
}]

const makeAnnotations = d3.annotation()
  .editMode(false)
  //also can set and override in the note.padding property
  //of the annotation object
  .notePadding(5)
  .type(annotype)
  //accessors & accessorsInverse not needed
  //if using x, y in annotations JSON
  .annotations(annotations)

g.append("g")
  .attr("class", "annotation-group")
  .call(makeAnnotations)

});

    
 function type(d) {
     d.x_pca = +d.x_pca
     d.y_pca = +d.y_pca
     d.y2_pca = +d.y2_pca
     d.x_tsne = +d.x
     d.y_tsne = +d.y;
     return d;
 };
