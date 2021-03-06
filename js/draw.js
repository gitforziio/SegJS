function dottedChart(data, id){


    data.forEach((d,i)=>{
        data[i].t_l_pct=Math.log(data[i].t_l_pct);
        data[i].t_r_pct=Math.log(data[i].t_r_pct);
    });


    var margin = {top: 50, right: 50, bottom: 50, left: 50},
        width = 500,
        height = 500;

    var xScale;
    xScale = d3.scaleLinear()
        .range([0, width])
        .domain([d3.min(data, d=>_.max([d.sxl_pct,d.sxr_pct]))-0.02, d3.max(data, d=>_.max([d.sxl_pct,d.sxr_pct]))+0.02])
        ;

    var yScale;
    // yScale = d3.scaleLog()
    yScale = d3.scaleLinear()
        .range([0, height])
        .domain([d3.max(data, d=>_.min([d.t_l_pct,d.t_r_pct])), d3.min(data, d=>_.min([d.t_l_pct,d.t_r_pct]))])
        // .domain([d3.min(data, d=>d.t_l_pct)-0.1, d3.max(data, d=>d.t_l_pct)+0.1])
        ;

    var xAxis = d3.axisBottom()
        .scale(xScale)
        // .ticks(8)
        ;
    var yAxis = d3.axisLeft()
        .scale(yScale)
        // .ticks(8)
        ;






    var oScale;
    oScale = d3.scaleLog()
        .range([0.25, 1])
        .domain([d3.min(data, d=>d.str_frq), d3.max(data, d=>d.str_frq)])
        ;






    //-MAIN--------------------------------------------------------------------//
    var theid = "#"+id;
    var svgid = theid+" svg";
    var the_svg = d3.select(svgid);
    var svg;
    var svg_g;
    var svg_g_g;
    var svg_levels;

    if (the_svg._groups[0][0] === null){
        console.log('the_svg does not exists!');
        svg = d3.select(theid).append("svg")
            .attr("viewBox", "0,0,"+(width + margin.left + margin.right).toString()+","
                    +(height + margin.top + margin.bottom).toString()+"")
            ;
        svg_g = svg.append("g")
            .attr("class", "mainchart")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            ;
        svg_g.append("rect")
            .attr("transform", `translate(-${margin.left},-${margin.top})`)
            .attr("width", `${width + margin.left + margin.right}`)
            .attr("height", `${height + margin.top + margin.bottom}`)
            .attr("fill", "#fafafa")
            // .attr("fill", "transparent")
            ;
        svg_g_g = svg_g.append("g")
            .attr("class", "mainfigure")
            ;
    } else {
        console.log('the_svg exists!');
        svg = the_svg;
        svg_g = svg.select("g.mainchart");
        svg_g_g = svg.select("g.mainfigure");
    }

    var svg_x_axis;
    svg_x_axis = svg_g.selectAll("g.axis.x-axis");
    svg_x_axis.remove();

    svg_x_axis = svg_g.append("g")
        .attr("class", "axis x-axis")
        .attr("transform",`translate(0,${height})`)
        .call(xAxis)
        ;
    svg_x_axis.append("text")
        .attr("transform",`translate(${width/2},${28})`)
        .text("←外部环境多样性")
        .attr("fill", "black")
        ;
    svg_x_axis.select(".domain")
        .attr("d", "M0,1V0H"+width+"V0");

    var svg_y_axis;
    svg_y_axis = svg_g.selectAll("g.axis.y-axis");
    svg_y_axis.remove();

    svg_y_axis = svg_g.append("g")
        .attr("class", "axis y-axis")
        .attr("transform","translate(0,0)")
        .call(yAxis);
    svg_y_axis.append("text")
        .attr("transform",`translate(${-32},${height/2}),rotate(-90)`)
        .text("内部凝固度（取了对数）→")
        .attr("fill", "black")
        ;
    svg_y_axis.select(".domain")
        .attr("d", "M0,0H0V"+height+"H0")
        ;

    svg_x_axis1 = svg_x_axis.clone(true)
        ;
    svg_x_axis.selectAll("path,line")
        .attr("stroke", "white")
        .attr("stroke-width", 3)
        ;
    svg_x_axis.selectAll("text")
        .attr("stroke", "white")
        .attr("fill", "white")
        .attr("stroke-width", 3)
        ;

    svg_y_axis1 = svg_y_axis.clone(true)
        ;
    svg_y_axis.selectAll("path,line")
        .attr("stroke", "white")
        .attr("stroke-width", 3)
        ;
    svg_y_axis.selectAll("text")
        .attr("stroke", "white")
        .attr("fill", "white")
        .attr("stroke-width", 3)
        ;


    var words = svg_g_g.selectAll("text.word").data(data);
    words.exit().remove();
    words = words.enter().append("text").merge(words)
        .text(function(d,i){return d.str})
        .attr("class", function(d,i){if(0){return"word word-highlight"}else{return"word"}})
        .attr("x", function(d,i){return xScale(_.max([d.sxl_pct,d.sxr_pct]))})
        .attr("y", function(d,i){return yScale(_.min([d.t_l_pct,d.t_r_pct]))})
        .attr("fill", function(d,i){return (d.sxl_pct>d.sxr_pct)?"green":((d.sxl_pct==d.sxr_pct)?"black":"blue")})
        .attr("font-size", "8")
        // .attr("opacity", d=>(1-d.a_pct))//
        // .attr("opacity", d=>(1-d.a_pct**.5))//
        .attr("opacity", d=>oScale(d.str_frq))//
        ;

    var dots = svg_g_g.selectAll("circle.dot").data(data);
    dots.exit().remove();
    dots = dots.enter().append("circle").merge(dots)
        .attr("class", function(d,i){if(0){return"dot dot-highlight"}else{return"dot"}})
        // .transition()
        .attr("r", "1")
        .attr("cx", function(d,i){return xScale(_.max([d.sxl_pct,d.sxr_pct]))})
        .attr("cy", function(d,i){return yScale(_.min([d.t_l_pct,d.t_r_pct]))})
        .attr("fill", "black")
        ;



    var zoom = d3.zoom()
        .extent([[0-margin.left, 0-margin.top], [width+margin.right, height+margin.bottom]])
        .scaleExtent([0.5, 16])
        .on("zoom", ()=>{
            let t = d3.event.transform;
            // svg_g_g.attr("transform", t);
            svg_x_axis.call(xAxis.scale(t.rescaleX(xScale)));
            svg_x_axis1.call(xAxis.scale(t.rescaleX(xScale)));
            svg_y_axis.call(yAxis.scale(t.rescaleY(yScale)));
            svg_y_axis1.call(yAxis.scale(t.rescaleY(yScale)));
            words
                .attr("transform", t)
                // .attr("transform-origin", `50% 50%`)
                .attr("font-size", `${8/(t.k)+t.k*0.1}`)
                ;
            dots
                .attr("transform", t)
                // .attr("transform-origin", `50% 50%`)
                .attr("r", `${1/(t.k)}`)
                ;
            svg_x_axis.selectAll("path,line")
                .attr("stroke", "white")
                .attr("stroke-width", 3)
                ;
            svg_x_axis.selectAll("text")
                .attr("stroke", "white")
                .attr("fill", "white")
                .attr("stroke-width", 3)
                ;
            svg_y_axis.selectAll("path,line")
                .attr("stroke", "white")
                .attr("stroke-width", 3)
                ;
            svg_y_axis.selectAll("text")
                .attr("stroke", "white")
                .attr("fill", "white")
                .attr("stroke-width", 3)
                ;
        })
        ;

    svg_g
        .call(zoom)
        // .call(zoom.transform, transform)
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
