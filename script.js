var pack;
var maps;
var path;
var currentmap;
var currentdoor;
var panel;
var subpanel;
var zoneselect;
var highlighted;

function load(){
    var files = document.getElementById("pack").files;
    if(files.length<1){
        alert("Please attach a JSON file!");
        return;
    }
    let fr = new FileReader();
    fr.onload = function() {
        var top = document.getElementById("main-input");
        pack = JSON.parse(fr.result);
        maps = pack.maps;
        top.innerHTML = "";
        var credits = pack.name + " pack by " + pack.author;
        if(pack.credit){
            credits += "<br>" + pack.credit;
        }
        document.getElementById("credits").innerHTML += credits;
        drawMap(pack.init?pack.init:0);
        zoneselect = document.createElement("select");
        top.insertAdjacentElement("beforebegin", zoneselect);
        for(var k=0; k<maps.length; k++){
            var z = document.createElement("option");
            z.value = k;
            z.innerHTML = maps[k].name;
            zoneselect.insertAdjacentElement("beforeend", z);
        }
        zoneselect.addEventListener("change", changeMap);
    }
    fr.readAsText(files[0]);
}

function drawMap(m){
    // Remove old map
    var map = document.getElementById("current-map");
    while(map.firstChild){
        map.removeChild(map.lastChild);
    }
    // Set background image & heading
    map.style.backgroundImage = "url('"+maps[m].map+"')";
    document.getElementById("heading").innerHTML = maps[m].name;
    // Draw nodes
    for(var d=0; d<maps[m].doors.length; d++){
        // Lines to connect doors to new zones
        var line = document.createElement("div");
        line.className = "line";
        line.style.left = maps[m].doors[d].x;
        line.style.top = maps[m].doors[d].y;
        line.style.rotate = "-" + maps[m].doors[d].theta + "deg";
        map.insertAdjacentElement("beforeend", line);
        // Color line based on exitability
        if(maps[m].doors[d].nType === "none"){
            line.style.backgroundColor = "blue";
        } else if(maps[m].doors[d].xType === "none"){
            line.style.backgroundColor = "red";
        }
        
        // Clickable area to edit doors
        if(!maps[m].doors[d].unchangeable){
            var door = document.createElement("div");
            door.className = "door";
            door.style.left = maps[m].doors[d].x;
            door.style.top = maps[m].doors[d].y;
            door.name = m + " " + d;
            door.addEventListener("click", doorClick)
            map.insertAdjacentElement("beforeend", door);
        } else {
            line.style.border = "2px solid gold";
        }

        // Icon for connected zones
        var exit = document.createElement("div");
        exit.className = "exit";
        line.insertAdjacentElement("beforeend", exit);
        exit.style.rotate = maps[m].doors[d].theta + "deg";
        if(maps[m].doors[d].exit){
            exit.style.backgroundImage = "url('" + maps[maps[m].doors[d].exit].icon + "')";
            exit.value = maps[m].doors[d].exit;
            exit.addEventListener("click", thingClicked);
        }
    }
}

// Change map based on value of thing clicked.
function thingClicked(){
    zoneselect.value = this.value;
    if(subpanel){
        subpanel.remove();
    }
    if(panel){
        panel.remove();
    }
    drawMap(this.value);
}

function changeMap(){
    if(subpanel){
        subpanel.remove();
    }
    if(panel){
        panel.remove();
    }
    drawMap(this.value);
}

// Clicking a door opens a panel to select a connecting zone.
function doorClick(){
    var n = this.name.split(" ");
    currentmap = n[0];
    currentdoor = n[1];
    if(subpanel){
        subpanel.remove();
    }
    if(panel){
        panel.remove();
    }
    panel = document.createElement("div");
    panel.id = "panel";
    document.body.insertAdjacentElement("beforeend", panel);
    if(highlighted){
        highlighted.style.backgroundColor = "transparent";
    }
    this.style.backgroundColor = "yellow";
    highlighted = this;
    openPanel();
}

function openPanel(){
    for(var k=0; k<maps.length; k++){
        var cell = document.createElement("div");
        cell.className = "panel-button";
        cell.name = k;
        cell.style.backgroundImage = "url('" + maps[k].icon + "')";
        cell.addEventListener("click", openSubpanel)
        panel.insertAdjacentElement("beforeend", cell);
    }
}

// Clicking a panel icon opens a sub-panel to select connecting door.
function openSubpanel(){
    if(subpanel){
        subpanel.remove();
    }
    var m = this.name;
    subpanel = document.createElement("div");
    subpanel.id = "subpanel";
    subpanel.style.backgroundImage = "url('" + maps[m].map + "')";
    document.body.insertAdjacentElement("beforeend", subpanel);
    for(var k=0; k<maps[m].doors.length; k++){
        var door = document.createElement("div");
        door.className = "subpanel-button";
        door.style.left = maps[m].doors[k].x;
        door.style.top = maps[m].doors[k].y;
        door.name = m + " " + k;
        // Don't add event listener if door is unchangeable :)
        if(!maps[m].doors[k].unchangeable){
            door.addEventListener("click", writeConnection);
        } else {
            door.style.border = "2px solid gold";
        }
        subpanel.insertAdjacentElement("beforeend", door);
        // Case where door is the same as the one being assigned
        if(m == currentmap && k == currentdoor){
            door.style.backgroundColor = "black";
        } else
        // Case where destination door is already assigned
        if(maps[m].doors[k].exit){
            door.style.backgroundColor = "#404040";
        } else
        // Case where door types don't match
        if(maps[m].doors[k].nType != maps[currentmap].doors[currentdoor].xType){
            door.style.backgroundColor = "red";
        }
    }
    var header = document.createElement("h2");
    header.innerHTML = maps[m].name;
    subpanel.insertAdjacentElement("beforeend", header);
}

// Clicking a door in the sub-panel map will update both connectors
function writeConnection(){
    var n = this.name.split(" ");
    var m = n[0];
    var d = n[1];
    maps[currentmap].doors[currentdoor].exit = m;
    // Write connection, but not for one-way exits
    if(maps[currentmap].doors[currentdoor].nType != "none"){
        maps[m].doors[d].exit = currentmap;
    }
    panel.remove();
    subpanel.remove();
    drawMap(currentmap);
}
