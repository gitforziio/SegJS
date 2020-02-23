function dottedChart(data, id){
    var margin = {top: 50, right: 50, bottom: 50, left: 50},
        width = 500,
        height = 500;

    var xScale;
    xScale = d3.scaleLinear()
        .range([0, width])
        .domain([d3.min(data, d=>d.sxl_pct)-0.1, d3.max(data, d=>d.sxl_pct)+0.1])
        ;

    var yScale;
    yScale = d3.scaleLinear()
        .range([0, height])
        .domain([d3.min(data, d=>d.t_l_pct)-0.1, d3.max(data, d=>d.t_l_pct)+0.1])
        ;

    var xAxis = d3.axisBottom()
        .scale(xScale)
        // .ticks(8)
        ;
    var yAxis = d3.axisLeft()
        .scale(yScale)
        // .ticks(8)
        ;



    //-MAIN--------------------------------------------------------------------//
    var theid = "#"+id;
    var svgid = theid+" svg";
    var the_svg = d3.select(svgid);
    var svg;
    var svg_g;
    var svg_levels;

    if (the_svg._groups[0][0] === null){
        console.log('the_svg does not exists!');
        svg = d3.select(theid).append("svg")
            .attr("viewBox", "0,0,"+(width + margin.left + margin.right).toString()+","
                    +(height + margin.top + margin.bottom).toString()+"");
        svg_g = svg.append("g")
            .attr("class", "mainchart")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    } else {
        console.log('the_svg exists!');
        svg = the_svg;
        svg_g = svg.select("g.mainchart");
    }

    var svg_x_axis;
    svg_x_axis = svg_g.selectAll("g.axis.x-axis");
    svg_x_axis.remove();

    svg_x_axis = svg_g.append("g")
        .attr("class", "axis x-axis")
        // .attr("transform","translate(0,"+(height).toString()+")")
        .attr("transform","translate(0,0)")
        .call(xAxis);
    // svg_x_axis.append("text")
    //     .attr("x", width/2)
    //     .attr("y", "3em")
    //     // .attr("dy", "-.71em")
    //    .style("text-anchor", "middle")
    //     .text("时间（年）");
    svg_x_axis.select(".domain")
        .attr("d", "M0,1V0H"+width+"V0");


    var svg_y_axis;
    svg_y_axis = svg_g.selectAll("g.axis.y-axis");
    svg_y_axis.remove();

    svg_y_axis = svg_g.append("g")
        .attr("class", "axis y-axis")
        .attr("transform","translate(0,0)")
        .call(yAxis);
    // svg_y_axis.append("text")
    //     .attr("x", "-1em")
    //     .attr("y", "0")
    //     .attr("dy", "-.5em")
    //    .style("text-anchor", "end")
    //     .text("类型");
    svg_y_axis.select(".domain")
        .attr("d", "M0,0H0V"+height+"H0");
        // .remove();
    // svg_y_axis.selectAll(".tick > line")
    //     .remove();
    // svg_y_axis.selectAll(".tick > text")
    //     .attr("textLength", function(){if(this.innerHTML.length<=26){return null}else{return "13em"}})
    //     .attr("lengthAdjust", "spacingAndGlyphs");


    // svg_g.selectAll("text.tiptext").remove();
    // svg_g.append("text").attr("class","tiptext").append("tspan").attr("class","tiptspan")
    //         .attr("x", width/2)
    //         .attr('text-anchor', 'middle')
    //         .text("xxx")
    //         ;

    // svg_g.selectAll("rect.stick").remove();
    // svg_g.append("rect").attr("class","stick")
    //         ;


    var words = svg_g.selectAll("text.word").data(data);
    words.exit().remove();
    words = words.enter().append("text").merge(words)
        .text(function(d,i){return d.str})
        .attr("class", function(d,i){if(0){return"word word-highlight"}else{return"word"}})
        .attr("x", function(d,i){return xScale(d.sxl_pct)})
        .attr("y", function(d,i){return yScale(d.t_l_pct)})
        .attr("fill", "black")
        .attr("font-size", "8")
        .attr("opacity", d=>(1-d.a_pct**.5))
        ;

    var dots = svg_g.selectAll("circle.dot").data(data);
    dots.exit().remove();
    dots = dots.enter().append("circle").merge(dots)
        .attr("class", function(d,i){if(0){return"dot dot-highlight"}else{return"dot"}})
        // .transition()
        .attr("r", "1")
        .attr("cx", function(d,i){return xScale(d.sxl_pct)})
        .attr("cy", function(d,i){return yScale(d.t_l_pct)})
        .attr("fill", "black")
        // .attr("width", function(d,i){if (d.timeFrom==d.timeTo){return 6}else{return Math.ceil(xScale(new Date(d.timeTo))-xScale(new Date(d.timeFrom)))}})
        // .attr("height", yScale.bandwidth())
        // .attr("fill", function(d,i){return cScale(d.type)})
        ;
    // dots.on('mouseover', function(d,i){
    //     svg_g.selectAll("text.tiptext")
    //         .classed("shown", true)
    //         ;
    //     svg_g.selectAll("tspan.tiptspan")
    //         .text(d.timeDisplay+"："+d.event)
    //         ;
    //     svg_g.selectAll("rect.stick")
    //         .attr("x", xScale(new Date(d.timeFrom)))
    //         .attr("y", yScale(d.type)+yScale.bandwidth())
    //         .attr("width", "1")
    //         .attr("height", height-yScale(d.type)-yScale.bandwidth())
    //         .classed("shown", true)
    //         ;
    // });
    // dots.on('mouseout', function(d,i){
    //     svg_g.selectAll("text.tiptext")
    //         .classed("shown", false)
    //         ;
    //     svg_g.selectAll("rect.stick")
    //         .classed("shown", false)
    //         ;
    // });

}
