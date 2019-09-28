var view;
var ctx;
var polygons = {
    convex: {
        color: '#2696ff', // choose color here!
        vertices: [
            {x:350,y:350}, {x:330,y:400}, {x:400, y:410}, {x:390,y:370} 
        ]
    },
    concave: {
        color: '#17d126', // choose color here!
        vertices: [
            {x:340,y:320}, {x:340,y:350}, {x:360, y:330}, {x:380,y:350}, {x:380,y:320} 
        ]
    },
    self_intersect: {
        color: '#7226ff', // choose color here!
        vertices: [	
			{x:340,y:320}, {x:380,y:350}, {x:380, y:320}, {x:340,y:350}
        ]
    },
    interior_hole: {
        color: '#eb4034', // choose color here!
        vertices: [
            {x:340,y:320}, {x:360,y:360}, {x:380, y:320}, {x:340,y:350}, {x:380,y:350} 
        ]
    }
};

// Init(): triggered when web page loads
function Init() {
    var w = 800;
    var h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;

    ctx = view.getContext('2d');

    SelectNewPolygon();
}

// DrawPolygon(polygon): erases current framebuffer, then draws new polygon
function DrawPolygon(polygon) {
    // Clear framebuffer (i.e. erase previous content)
    ctx.clearRect(0, 0, view.width, view.height);

    // Set line stroke color
    ctx.strokeStyle = polygon.color;

    // Create empty edge table (ET)
    var edge_table = [];
    var i;
    for (i = 0; i < view.height; i++) {
        edge_table.push(new EdgeList());
    }

    // Create empty active list (AL)
    var active_list = new EdgeList();

    // Step 1: populate ET with edges of polygon
    var y_min;
    var new_edge;
    for (var i=0; i < polygon.vertices.length;i++){
    	if (i==polygon.vertices.length-1){
    		y_min = Math.min(polygon.vertices[i].y, polygon.vertices[0].y);
    		new_edge = BuildEdgeEntry(polygon.vertices[i], polygon.vertices[0]);
    		edge_table[y_min].InsertEdge(new_edge);
    	}
    	else{
    		y_min = Math.min(polygon.vertices[i].y, polygon.vertices[i+1].y);
    		new_edge = BuildEdgeEntry(polygon.vertices[i], polygon.vertices[i+1]);
    		edge_table[y_min].InsertEdge(new_edge);
    	}
    	console.log("EDGE TABLE UPDATE:")
    	console.log(y_min);
    	console.log(edge_table[y_min]);
    }
    // Step 2: set y to first scan line with an entry in ET
    var y;
    for (var i =0; i < edge_table.length;i++){
    	if (edge_table[i].first_entry!==null){
    		y = i;
    		break;
    	}
    }
    // Step 3: Repeat until ET[y] is empty and AL is empty
    var count = 0;
	while (edge_table[y].first_entry !==null || active_list.first_entry !==null){
		console.log(count);
    //   a) Move all entries at ET[y] into AL
    	if (edge_table[y].first_entry!==null){
	    	var cur_edge = edge_table[y].first_entry;
	    	console.log(cur_edge);
	    	active_list.InsertEdge(new EdgeEntry(cur_edge)); //insert the first edge, which should always exist
	    	cur_edge = cur_edge.next_entry;
	    	while (cur_edge!==null){ //traverse the LL until the current edge is null, adding each to the AL 
	    		active_list.InsertEdge(cur_edge);
	    		cur_edge = cur_edge.next_entry;
	    	}
    	}
    //   b) Sort AL to maintain ascending x-value order
    	active_list.SortList();
    //   c) Remove entries from AL whose ymax equals y
    	active_list.RemoveCompleteEdges(y);
    	if (active_list.first_entry===null){break;} //double-check to make sure the AL hasn't been nulled from edge removal
    //   d) Draw horizontal line for each span (pairs of entries in the AL)
    	var e1 = active_list.first_entry;
    	var e2 = e1.next_entry;
    	DrawLine(e1.x,y,e2.x,y);
    	e1 = e2.next_entry;
    	while (e1!==null)
    	{
    		e2 = e1.next_entry;
    		DrawLine(e1.x,y,e2.x,y);
	    	e1 = e2.next_entry;
    	}
    //   e) Increment y by 1
    	y++;
    //   f) Update x-values for all remaining entries in the AL (increment by 1/m)
    	e1 = active_list.first_entry;
    	e1.x+=e1.inv_slope;
    	while (e1.next_entry!==null)
    	{
    		e1 = e1.next_entry;
    		e1.x+=e1.inv_slope;
    	}
    	count++;
    }
}

function BuildEdgeEntry(v1, v2){
	var y_max = Math.max(v1.y, v2.y);
	var x_ymin = (v1.y < v2.y ? v1.x : v2.x);
	var delta_x = v2.x-v1.x;
	var delta_y = v2.y-v1.y;
	return new EdgeEntry(y_max, x_ymin, delta_x, delta_y);
}

// SelectNewPolygon(): triggered when new selection in drop down menu is made
function SelectNewPolygon() {
    var polygon_type = document.getElementById('polygon_type');
    DrawPolygon(polygons[polygon_type.value]);
}

function DrawLine(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
