/**
 * Modified by Conor Myhrvold on 3/15/14.
 */
    var bbVis, brush, createVis, dataSet, handle, height, margin, svg, svg2, width;

    margin = {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50
    };

    width = 960 - margin.left - margin.right;
    height = 600 - margin.bottom - margin.top;

    bbVis = {
        x: 0 + 100,
        y: 10,
        w: width - 100,
        h: 400
    };

    svg = d3.select("#vis").append("svg").attr("id","mySVG").attr({
        width: width + margin.left + margin.right,
        height: height + margin.top + margin.bottom
    }).append("g").attr({
            transform: "translate(" + margin.left + "," + margin.top + ")"
        });

    d3.csv("pop_data2.txt", function(data) {
        return createVis(data);
    });
    
    var xAxis, xScale, yAxis, yScale;
    createVis = function(dataSet) {
          
          var color = d3.scale.category10().domain(d3.keys(dataSet[0]).filter( function(key) { return key !== "year"; })); //create color scale like Bostock example. have diff color per line http://bl.ocks.org/mbostock/3884955
          
          //convert data to variables with an array of dictionaries that has year: population value. follow Bostock example -- use map
            var populations = color.domain().map(function(name) {
                var pop_values = dataSet.map( function(d) {
                    var p = parseFloat(d[name]);
                    if( isNaN(p)) {
                        return {year: d.year, pop: p, original: "no" };} //tag data to see if it's original or not...
                    if( !isNaN(p)) {   
                        return {year: d.year, pop: p, original: "yes" };} // ... i.e. part of original dataset. use to distinguish from interpolation.                  
                });        
                //create list that name & values in one array
                return { name: name, values: pop_values}; //keep name same, but make the values the pop values from the name's pop
            });
               
          //remove data < 1950 AD to better see viz 
          recent_pops = populations;  //[41:populations.length]slice to truncate data ... //prepare to only display recent pops     
          //note: tried to do this in Javascript but the problem is that the data structure is not a simple array.
          //So John Resig's (jQuery creator) remove array wouldn't work; and I couldn't get slice to work either because I'd have to assign a new array in the same
          //data structure that we have, and this one is from parsing so it's tough to build from scratch...so I just deleted the values below 2050!
          //I was grabbing the right values via slicing, but couldn't manage to save it in a format to plot again in the same way that I did before.
          
//          for(i=0;i<recent_pops.length;i++){ //for each one of 5 population estimate curves
          //recent_pops[i].values = recent_pops[i]values.slice(48,recent_pops.length);            
          //looking at data, index of 48 and up is 1950. so we want to keep those. otherwise, remove.
//                for(j=0;j<recent_pops[i].values.length;j++){
          //          var temp = recent_pops[i].values.slice(48,recent_pops[i].values.length); 
                    
          //          recent_pops[i].values = recent_pops[i].temp ;
                    
                    //console.log(recent_pops[i].values);
                    //console.log(j);
           
            //    var temp = recent_pops[i].values; 
            
//                    if(j<48){ //if the year is below 1950

                        //console.log( recent_pops[i].values[j] ); //use the remove feature of the array ... use splice
//                        recent_pops[i].values[j].original = "remove"; //flag for removal 
//                        console.log( recent_pops[i].values[j] );
 //                   }
 //               }
 //           }                  
         // console.log(recent_pops);
          
          //define scales first
          xScale = d3.scale.linear().domain([1950,2050]).range([0,bbVis.w]);  // 1950 AD - 2050 AD
          yScale = d3.scale.linear().domain([0,10e9]).range([bbVis.h,0]); // define the right y domain and range -- use bbVis
          //define axes
          xAxis = d3.svg.axis().scale(xScale).orient("bottom");
          yAxis = d3.svg.axis().scale(yScale).orient("left").ticks(5);   
        
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

        //write function that, overall, looks at the global min and max pop from 1950-2050. can't just use d3.min and d3.max since we have an array of 5 arrays
        //we could use d3 min and d3 max on each of five, and then compare the five against each other to pick the min min and the max max, but I write a loop that goes through
        //all at once.        
        var min_pop = 10e9;
        var max_pop = 0;
        for(i=0;i<recent_pops.length;i++){ //for each one of 5 population estimate curves
            for(j=0;j<recent_pops[i].values.length;j++){
                var temp = parseInt(recent_pops[i].values[j].pop);
                if( !isNaN(temp) ){
                    if(temp > max_pop) {
                        max_pop = temp; //console.log(max_pop);
                    }
                    if(temp < min_pop) {
                        min_pop = temp;
                    }
                }
            } 
        }
        console.log("max pop is:",max_pop);
        console.log("min pop is:",min_pop);
        
        //write function that examines the maximum difference in estimates between the population

       var diff_array = new Array(recent_pops[0].values.length); //array for storing differences
       for(i=0;i<recent_pops.length;i++){
            var current_pop = recent_pops[i].values;
            for(j=0;j<current_pop.length;j++){
                if( !isNaN(parseInt(current_pop[j].pop)) ){
                    console.log(current_pop[j].pop); //now we have all of the values
                }
            }
 
       }
        //console.log(diff_array);
        
        var size_scale_color = d3.scale.linear().domain([min_pop,max_pop]).interpolate(d3.interpolateRgb).range(["blue", "red"]); //converts dot color depending on actual pop estimate (size)
        var size_scale = d3.scale.linear().domain([min_pop,max_pop]).range([1,10]); //different size option I didn't ultimately use
        
        //make dots
        for(i=0;i<recent_pops.length;i++){
            var current_pop = recent_pops[i].values;
            for(j=0;j<current_pop.length;j++){
                if( !isNaN(current_pop[j].pop) ) {
                    var X = xScale(current_pop[j].year);
                    var Y = yScale(current_pop[j].pop);                    
                    var size = 2;
                    if(current_pop[j].year >= 2015) { //if the year is in the future, we'll size these data points differently
                        size = 5;
                    }
                                        
                    var circle = visFrame.append("g").attr("class", "points")
                                                     .selectAll(".dot")                                    
                                                     .data(current_pop)
                                                     .enter()
                                                     .append("circle")
                                                     .attr("r", function(d) { 
                                                                               if(!isNaN(d.pop)) {
                                                                                    return size_scale(d.pop) }
                                                                               if(isNaN(d.pop)) {
                                                                                    return 0;
                                                                               }
                                                                                    })
                                                     //.attr("r", size)
                                                     .attr("cx", X)
                                                     .attr("cy", Y)
                                                     .style("fill", function(d) { return size_scale_color(d.pop) } );          
                }
            }
        }
    
    };