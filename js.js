    //Initiating Variables
    var canvas = document.getElementById("imgCanvas");
    var context = canvas.getContext("2d");
    canvas.addEventListener('click',createElement,false )
    serverAddress='https://drawall.azurewebsites.net/';
    var shape='Triangle';
    var color='black';
    var size=50;
    var ip;
    var currentElement;
    var currentBoard='main';
    //var x;
    //var y;
    
    //Updating Variables Function
    function saveElement(elm){
        shape=elm;
    }
    function canvasReady(){
        canvas.onmousedown = draw;
        getBoard();
        getIP();
        redraw();
    }
    function getBoard(){
        if(window.location.hash) {
            var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
            currentBoard=hash;
        } else {
            currentBoard='main';
        }
    }
    function getIP(){
        $.getJSON('https://json.geoiplookup.io/api?callback=?', function(data) {
            ip=data.ip;
        });
    }
  
    //Redraw elements from DB 
    function redraw(){
        $.getJSON(serverAddress+currentBoard, function(result){
            $.each(result, function(i, field){
                field.size=parseInt(field.size);
                draw(field)
            });
        });
    }

    //Create an Element on a mouse click
    function createElement(e){
        var rect = canvas.getBoundingClientRect();
        var color=document.getElementById('colorP').value;
        var size=parseInt(document.getElementById('myRange').value);
        var currElement={
            ip:ip,
            shape:shape,
            size:size,
            color:color,
            x:e.clientX - rect.left,
            y:e.clientY - rect.top,
        }
        saveElementDB(canvas,currElement)
        draw(currElement)

    }

    //Controller for drawing function. Draws the relevent shape.
    function draw(element){
        if(element.shape=='Circle'){
            drawCirle(element);
        }
        else if(element.shape=='Triangle'){
            drawTriangle(element);
        }
        else if(element.shape=='Rectangle'){
            drawRectangle(element);
        }
        else if(element.shape=='Star'){
            drawStar(element);
        }
    }


    //Shape draw functions
    function drawRectangle(element){
        //var pos = getMousePos(canvas, e);
        posx = element.x;
        posy = element.y;
        context.fillStyle = element.color;
        context.beginPath();
        context.rect(posx-(element.size/2),posy-(element.size/2),element.size,element.size); 
        context.fill();
    }
    function drawCirle(element) {
        //var pos = getMousePos(canvas, e);
        posx =element.x;
        posy = element.y;
        context.fillStyle = element.color;
        context.beginPath();
        context.arc(posx, posy, element.size/2, 0, 2*Math.PI);
        context.fill();
    }
    function drawTriangle(element){
        //var pos = getMousePos(canvas, e);
        posx = element.x;
        posy = element.y;
        context.beginPath();
        context.moveTo(posx, posy);
        context.lineTo(posx, posy+element.size);
        context.lineTo(posx+element.size, posy+element.size);
        context.fillStyle = element.color;
        context.closePath();
        context.fill();
    }
    function drawStar(element){

        var rot=Math.PI/2*3;
        var x=element.x;
        var cx=element.x;
        var y=element.y;
        var cy=element.y;
        var outerRadius=element.size/2;
        var innerRadius=element.size/4;
        var spikes=10;
        var step=Math.PI/spikes;

        context.beginPath();
        context.moveTo(cx,cy-outerRadius)
        for(i=0;i<spikes;i++){
            x=cx+Math.cos(rot)*outerRadius;
            y=cy+Math.sin(rot)*outerRadius;
            context.lineTo(x,y)
            rot+=step

            x=cx+Math.cos(rot)*innerRadius;
            y=cy+Math.sin(rot)*innerRadius;
            context.lineTo(x,y)
            rot+=step
        }
        context.lineTo(cx,cy-outerRadius);
        context.closePath();
        context.fillStyle=element.color;
        context.fill();
          
    }

    function createNewBoard(){
        var name=document.getElementById('groupName').value;
        var limit=document.getElementById('limitation').value       ;
        var currip=ip;
        if(limit<30){
            alert("Please increase your limit");
            return;
        }
        $.post( serverAddress+"newBoard", {
            'name':name,
            'limit':limit,
            'ip':currip
        })
        .done(function( data ) {
            if(data.response=="success"){
                window.location.href =window.location.href+'#'+name;
            }
            else{
                alert("The Name is already taken");
            }

        });
    }
    //
    function showBoardOptions(){
        var container = document.getElementById("newBoard");

        var groupNameLabel=document.createElement('label');
        groupNameLabel.id="groupNameLabel";
        groupNameLabel.innerHTML = "Name your board";
        var groupName = document.createElement('input');
        groupName.id="groupName";
        var limitationLabel=document.createElement('label');
        limitationLabel.id="limitationLabel";
        limitationLabel.innerHTML = "Max Number of Elements";
        var limitation = document.createElement('input');
        limitation.id="limitation";
        var create=document.createElement('button');
        create.id="create";
        create.innerHTML="Create";
        create.addEventListener('click', createNewBoard);
        container.appendChild(groupNameLabel);
        container.appendChild(groupName);
        container.appendChild(limitationLabel);
        container.appendChild(limitation);
        container.appendChild(create);
    }

    

    //Save Element to DB
    function saveElementDB(canvas,element) {
        var rect = canvas.getBoundingClientRect();

        $.post( serverAddress+"element", {
            'board':currentBoard,
            'ip':element.ip,
            'shape':element.shape,
            'color':element.color,
            'size':element.size,
            'x': element.x,
            'y': element.y
        })
        .done(function( data ) {
        });
    }



    canvasReady();

