//Conor Myhrvold, 3/15/14

var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 100
};

var width = 960 - margin.left - margin.right;
var height = 800 - margin.bottom - margin.top;

var bbOverview = {
    x: 0,
    y: 10,
    w: width,
    h: 50
};

var bbDetail = {
    x: 0,
    y: 100,
    w: width,
    h: 300
};

var convertToInt = function(s) {
    return parseInt(s.replace(/,/g, ""), 10);
};

var dataSet = [];

var parseDate = d3.time.format("%b-%y").parse; //use parse date like Bostock example: http://bl.ocks.org/mbostock/3883245

var svg = d3.select("#visUN").append("svg").attr("id","mySVG").attr({
    width: width + margin.left + margin.right,
    height: height + margin.top + margin.bottom
}).append("g").attr({
        transform: "translate(" + margin.left + "," + margin.top + ")"
    });

d3.csv("unHealth.csv", function(data) { //source of data: http://unglobalpulse.net/ewec/
        dataSet = data;
        
        dataSet.forEach(function(d) { //console.log(d)
            d.AnalysisDate = parseDate(d.AnalysisDate);
            d.WomensHealth = convertToInt(d.WomensHealth);
           });
  
        return createVis(data); //set up like problem 2
});

    createVis = function(data) {
    
    //create two SVG spaces for upper (overview) & lower (detail) viz's
    var visFrameOverview = svg.append("g").attr({
		      "transform": "translate(" + bbOverview.x + "," + bbOverview.y + ")"			  
		  });		  
    var visFrameDetail = svg.append("g").attr({
		      "transform": "translate(" + bbDetail.x + "," + bbDetail.y + ")"			  
		  });		  

    //define scales
    var xScaleDetail = d3.time.scale().domain([data[0].AnalysisDate,data[data.length-1].AnalysisDate]).range([0, bbDetail.w]); //time scale
    var yScaleDetail = d3.scale.linear().range([bbDetail.h, 0]); //tweet scale
    var xScaleOverview = d3.time.scale().domain([data[0].AnalysisDate,data[data.length-1].AnalysisDate]).range([0, bbOverview.w]); //time scale
    var yScaleOverview = d3.scale.linear().range([bbOverview.h, 0]); //tweet scale 
    
    //define axes
    var xAxisDetail = d3.svg.axis().scale(xScaleDetail).orient("bottom");
    var yAxisDetail = d3.svg.axis().scale(yScaleDetail).orient("left");   
    var xAxisOverview = d3.svg.axis().scale(xScaleOverview).orient("bottom");
    var yAxisOverview = d3.svg.axis().scale(yScaleOverview).orient("left");   
         
   //interpolate data
   var lineDetail = d3.svg.line()
                .interpolate("monotone")
                .x(function(d) {return xScaleDetail(d.AnalysisDate);})
                .y(function(d) {return yScaleDetail(d.WomensHealth);});

   var lineOverview = d3.svg.line()
                .interpolate("monotone")
                .x(function(d) {return xScaleOverview(d.AnalysisDate);})
                .y(function(d) {return yScaleOverview(d.WomensHealth);});
                
   //code block from Mike Bostock example: http://bl.ocks.org/mbostock/1667367#index.html
    var areaDetail = d3.svg.area()
                           .interpolate("monotone")
                           .x(function(d) { return xScaleDetail(d.AnalysisDate); })
                           .y0(bbDetail.h)
                           .y1(function(d) { return yScaleDetail(d.WomensHealth); });
    var areaOverview = d3.svg.area()
                             .interpolate("monotone")
                             .x(function(d) { return xScaleOverview(d.AnalysisDate); })
                             .y0(bbOverview.h)
                             .y1(function(d) { return yScaleOverview(d.WomensHealth); });

    //brushing for upper area       
    var brush = d3.svg.brush().x(xScaleOverview).on("brush", brushed);
    
    xScaleDetail.domain(d3.extent(dataSet, function(d) { return d.AnalysisDate; }));
    yScaleDetail.domain(d3.extent(dataSet, function(d) { return d.WomensHealth; }));
    xScaleOverview.domain(d3.extent(dataSet, function(d) { return d.AnalysisDate; }));
    yScaleOverview.domain(d3.extent(dataSet, function(d) { return d.WomensHealth; }));
 
 
    //lower visualization for detail
    visFrameDetail.append("g")
      .call(xAxisDetail)
      .attr("class", "x axis")
      .attr("transform", "translate("+ bbDetail.x+ "," + (bbDetail.h + bbDetail.y) + ")");
             
    visFrameDetail.append("g")
       .call(yAxisDetail)
       .attr("class", "y axis")
       .attr("transform", "translate("+ bbDetail.x+ "," + bbDetail.y + ")")
       .append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 6)
       .attr("dy", "-4.8em")
       .style("text-anchor", "end")
       .text("Tweets");

    //make lines
    visFrameDetail.append("path")
       .datum(dataSet)
       .attr("class", "line")
       .attr("d", lineDetail)
       .attr("transform", "translate("+ bbDetail.x+ "," + bbDetail.y + ")");
    
    //make dots
    visFrameDetail.append("g").attr("class", "points")
                   .selectAll(".dot")
                   .data(dataSet)
                   .enter()
                   .append("circle")
                   .attr("class", "dot")
                   .attr("r", 3)
                   .attr("cx", lineDetail.x() )
                   .attr("cy", lineDetail.y() ) 
                   .attr("transform", "translate("+ bbDetail.x+ "," + bbDetail.y + ")");

                   
                   
    //upper visualization for overview
    visFrameOverview.append("g")
      .call(xAxisOverview)
      .attr("class", "x axis")
      .attr("transform", "translate("+ bbOverview.x+ "," + (bbOverview.h + bbOverview.y) + ")");
    
    //not showing the y axis on upper viz due to clutter, spacing and font issues...
    //visFrameOverview.append("g")
    //   .call(yAxisOverview)
    //   .attr("class", "y axis")
    //   .attr("transform", "translate("+ bbOverview.x+ "," + bbOverview.y + ")");

    //make lines
    visFrameOverview.append("path")
       .datum(dataSet)
       .attr("class", "line")
       .attr("d", lineOverview)
       .attr("transform", "translate("+ bbOverview.x+ "," + bbOverview.y + ")");
    
    //make dots
    visFrameOverview.append("g").attr("class", "points")
                   .selectAll(".dot")
                   .data(dataSet)
                   .enter()
                   .append("circle")
                   .attr("class", "dot")
                   .attr("r", 1)
                   .attr("cx", lineOverview.x() )
                   .attr("cy", lineOverview.y() ) 
                   .attr("transform", "translate("+ bbOverview.x+ "," + bbOverview.y + ")");
    
    
    //make brushing    
    svg.append("g").attr("class", "brush").call(brush)
                  .selectAll("rect").attr({
                    height: bbOverview.h,
                    transform: "translate(20,100)"
                });
    
    //upper visualization for brushing -- below function modelled on this Bostock example: http://bl.ocks.org/mbostock/1667367#in
    function brushed() {
      xScaleOverview.domain(brush.empty() ? xScaleOverview.domain() : brush.extent());
      focus.select(".area").attr("d", areaOverview);
      focus.select(".x.axis").call(xAxisOverview);      

    };      
      
};