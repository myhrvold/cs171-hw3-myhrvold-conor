/**
 * Modified by Conor Myhrvold on 3/11/14.
 */
    var bbVis, brush, createVis, dataSet, handle, height, margin, svg, svg2, width;

    margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 130
    };

    width = 960 - margin.left - margin.right;
    height = 300 - margin.bottom - margin.top;

    bbVis = {
        x: 0 + 100,
        y: 10,
        w: width - 100,
        h: 100
    };

    svg = d3.select("#vis").append("svg").attr("id","mySVG").attr({
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom
    }).append("g").attr({
            transform: "translate(" + margin.left + "," + margin.top + ")"
        });

    d3.csv("pop_data.txt", function(data) {
        return createVis(data);
    });
    
    var xAxis, xScale, yAxis, yScale;
    createVis = function(dataSet) {
          
          var color = d3.scale.category10().domain(d3.keys(dataSet[0]).filter( function(key) { return key !== "year"; })); //create color scale like Bostock example. have diff color per line http://bl.ocks.org/mbostock/3884955

          //convert data to variables with an array of dictionaries that has year: population value. follow Bostock example -- use map
            var populations = color.domain().map(function(name) {
                //console.log(name); //name of the census data in the dataset, i.e. USCensus
                var pop_values = dataSet.map( function(d) { //console.log(d);
                    var p = parseFloat(d[name]);
                    if( isNaN(p)) {
                        return {year: d.year, pop: p, original: "no" };} //tag data to see if it's original or not...
                    if( !isNaN(p)) {   
                        return {year: d.year, pop: p, original: "yes" };} // ... i.e. part of original dataset. use to distinguish from interpolation.                  
                });        
                //create list that name & values in one array
                return { name: name, values: pop_values}; //keep name same, but make the values the pop values from the name's pop
            });
        //console.log(populations);
        //interpolate
        for(i=0;i<populations.length;i++){ //iterates through columns
            var current_pop = populations[i].values; //console.log(current_pop);
            var j_min = 0;
            var nan_values = 0;
            for(j=0;j<current_pop.length;j++){ //iterate through subrows
                if( !isNaN(current_pop[j].pop ) ) { //console.log(current_pop[j].pop);
                    j_min = j;
                }
                if( isNaN(current_pop[j].pop) && j>j_min ) {
                    nan_values += 1; //tally NaN values
                }
                if( !isNaN(current_pop[j].pop) && nan_values>0) {
                    j_min = j-nan_values - 1;
                    xScale_interp = d3.scale.linear().domain([0,nan_values+1]).range([current_pop[j_min].pop,current_pop[j].pop])
                    for(k=0;k<nan_values;k++){
                        current_pop[k+j_min].pop = xScale_interp(k) ; //interpolating                        
                    }
                    nan_values = 0; //set back to zero
                    j_min = j; //moves curve up to next point
                }
            }
            
        }
        console.log(populations);
            
          //define scales first
          xScale = d3.scale.linear().domain([0,2050]).range([0,bbVis.w]);  // 0 AD - 2050 AD (d3.extent dataset year returns 0-900 for some reason...)
          yScale = d3.scale.linear().domain([0,10e9]).range([bbVis.h,0]); // define the right y domain and range -- use bbVis
          //define axes
          xAxis = d3.svg.axis().scale(xScale).orient("bottom");
          yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(4);   
        
		  // example that translates to the bottom left of our vis space:
		  var visFrame = svg.append("g").attr({
		      "transform": "translate(" + bbVis.x + "," + bbVis.y + ")"			  
		  });		  
		  visFrame.append("rect");
          
        //Add Axes
        //add x axis to svg 
        visFrame.append("g")
           .attr("class", "x axis")
           .attr("transform", "translate(" + 0 + "," + bbVis.h + ")")
           .call(xAxis)
           .append("text")
           .attr("x", 300)
           .attr("y", 35)
           .style("text-anchor", "end")
           .text("Year (AD)");
        //See: http://bl.ocks.org/mbostock/3884955 example for y axis settings
        //add y axis to svg
        visFrame.append("g")
           .attr("class", "y axis")
           .attr("transform", "translate(" + 0 + "," + 0 + ")")
           .call(yAxis)
           .append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 0)
           .attr("dy", "-7.8em")
           .style("text-anchor", "end")
           .text("World Population");
   
        //make dots
        for(i=0;i<populations.length;i++){ //console.log("hello!");
            var current_pop = populations[i].values; //console.log(current_pop);
            for(j=0;j<current_pop.length;j++){
                if( !isNaN(current_pop[j].pop) ) {
                    var X = xScale(current_pop[j].year);
                    var Y = yScale(current_pop[j].pop);
                    var alt_size = current_pop[j].original ; //see whether data pt is original or not based on tag
                    var size = 3;
                    if(current_pop[j].original == "yes") {
                        size = 5;
                    }
                    visFrame.attr("class", "points")
                            .append("circle")
                            .attr("r", size)  //sets radius of pts to 3 if they're interpolated; 5 if they're not.
                            .attr("cx", X)
                            .attr("cy", Y)
                            .attr("fill",color(i));
                }
            }
        }

        //make lines
        for(i=0;i<populations.length;i++){
            var current_pop = populations[i].values; //console.log(current_pop);
            for(j=1;j<current_pop.length;j++){ //iterate from 1st neighbor on
                if( !isNaN(current_pop[j].pop) && !isNaN(current_pop[j-1].pop) ) {
                    var X1 = xScale(current_pop[j].year);
                    var Y1 = yScale(current_pop[j].pop);
                    var X2 = xScale(current_pop[j-1].year); //neighbor
                    var Y2 = yScale(current_pop[j-1].pop);  //neighbor                   
                    visFrame.attr("class", "lines")
                            .append("path")
                            .attr("d","M "+X1+" "+Y1+" L "+X2+" "+Y2+"")
                            .attr("stroke",color(i));
                }
            }
        }        
                              
    };