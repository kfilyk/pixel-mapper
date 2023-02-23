var mouseX = 0;
var mouseY = 0;
var scrollX = 0;
var scrollY = 0;
leftClicked = false;
rightClicked = false;
drawSize = 50;
var img = new Image();
const canvas = document.querySelector('canvas')
canvas.width = window.innerWidth;
canvas.height = window.innerHeight-50;
const canvas_draw = document.getElementById('canvas-draw')
canvas_draw.width = window.innerWidth;
canvas_draw.height = window.innerHeight-50;
var cursor = document.querySelector('.cursor');
cursor.style.width = drawSize+"px";
cursor.style.height = drawSize+"px";

var ctx_image = canvas.getContext('2d');
var ctx_draw = canvas_draw.getContext('2d');

function init() {
    canvas_draw.addEventListener('mousedown', function(e) {
        if(e.button == 0){
            leftClicked = true;
        } else if(e.button == 2) {
            rightClicked =true;
        }
    })
    canvas_draw.addEventListener('mouseup', function(e) {
        console.log("Raised")
        leftClicked = false;
        rightClicked =false;

    })
    canvas_draw.addEventListener("mouseleave", function(e) {
        leftClicked = false;
        rightClicked = false;
    })
    canvas_draw.addEventListener("dragenter", catchDrag);
    canvas_draw.addEventListener("dragover", catchDrag);
    canvas_draw.addEventListener("drop", dropFile);

    window.requestAnimationFrame(draw);
}

window.onscroll = function() {
    var doc = document.documentElement;
    scrollX = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    scrollY = (window.pageYOffset || doc.scrollTop)  - (doc.clientTop || 0);
}


//------------------------------------------------------ CURSOR FUNCTIONALITY ------------------------------------------------------//



const positionCursor = (event) => {
    const rect = canvas.getBoundingClientRect()
    console.log("RELATIVE CANVAS SIZE:", canvas.width / canvas.clientWidth)
    mouseX = (event.clientX - rect.left) * canvas.width / canvas.clientWidth;
    mouseY = (event.clientY - rect.top) * canvas.height / canvas.clientHeight;
    cursor.style.transform = `translate(${event.clientX + scrollX - drawSize/2}px, ${event.clientY + scrollY - drawSize/2}px)`;
    //console.log("x: " + mouseX + " y: " + mouseY)

}

window.addEventListener('mousemove', positionCursor)

document.getElementById('cursor-size-slider').addEventListener('change', function(e) {
    console.log("sliding: ", e.target.value)
    drawSize = e.target.value;
    cursor.style.width = drawSize+"px";
    cursor.style.height = drawSize+"px";
})


//------------------------------------------------------ UPLOAD FUNCTIONALITY ------------------------------------------------------//

function catchDrag(event) {
    console.log("FLAG")
	event.dataTransfer.dropEffect = "copy"
	event.preventDefault();
}

function dropFile(event) {
    console.log("FLAG")
    event.preventDefault();
    if(event.dataTransfer)
        if(event.dataTransfer.files)
            procFile(event.dataTransfer.files[0]);
}

function procFile(file) {
    console.log("processing file " + file.name);
    img.src = file.path;
    console.log(file)

    img.onload = function () {
        //draw background image
        canvas.width = img.width;
        canvas.height = img.height;
        canvas_draw.width = img.width;
        canvas_draw.height = img.height;
        ctx_image.drawImage(img, 0, 0);
    };
}

 //------------------------------------------------------ DRAW FUNCTIONALITY ------------------------------------------------------//


function draw() {
    //https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation
    //ctx.globalCompositeOperation = "copy";

    //ctx_draw.globalCompositeOperation = 'source-over';
    if(leftClicked) {
        ctx_draw.globalCompositeOperation = 'source-over'

        ctx_draw.beginPath();
        ctx_draw.fillStyle = "rgb(0, 0, 255)";
        ctx_draw.arc(mouseX, mouseY, (drawSize*(canvas.width / canvas.clientWidth))/2, 0, 2 * Math.PI, false);
        ctx_draw.fill();
    } else if(rightClicked) {
        ctx_draw.globalCompositeOperation = 'destination-out'
        ctx_draw.beginPath();
        ctx_draw.fillStyle = "rgb(0, 0, 0)";
        ctx_draw.arc(mouseX, mouseY, (drawSize*(canvas.width / canvas.clientWidth))/2, 0, 2 * Math.PI, false);
        ctx_draw.fill();

    }
    /* else {
        ctx.beginPath();
        ctx.strokeStyle = "rgba(0,0, 255, 128)";
        ctx.arc(mouseX, mouseY, 10, 0, 2 * Math.PI, false);
        ctx.stroke();
    }
    */

    window.requestAnimationFrame(draw);
}
  
init();

//------------------------------------------------------ SAVE FUNCTIONALITY ------------------------------------------------------//

function saveForm() {
    //console.log("HTML: ", document)
    var form = {}

    var type = document.getElementById("type-selector")
    form['type'] = type.options[type.selectedIndex].value

    var location = document.getElementById("location-selector")
    form['location'] = location.options[location.selectedIndex].value

    form['header'] = $('#proposal-header')[0].outerHTML;
    /*
    var $inputs = $('#proposal-header :input');
    console.log($inputs)
    $inputs.each(function() {
        form[this.id] = $(this).val();
    });
    */

    var element = 0; // start denoting memo elements; and save them in order
    var rows = $('#memo').children('tr').map(function() {

        // get all inputs, selects, and textareas 
        var classes = $(this).attr('class')
        console.log($(this))
        if(classes.includes('table-container')) {
            console.log("TABLE");
            form['e'+element] = $(this)[0].outerHTML;
            element++

        } else if(classes.includes('section-container')) {
            console.log("SECTION");
            var txtarea = $(this).find('textarea')[0]
            txtarea.textContent = txtarea.value /* save text area content */ 
            form['e'+element] = $(this)[0].outerHTML;
            element++

        } else if(classes.includes('image-container')) {
            console.log("IMAGE");
            form['e'+element] = $(this)[0].outerHTML;
            element++

        } else if(classes.includes('signature-container')) {
            console.log("SIGNATURE");
            form['e'+element] = $(this)[0].outerHTML;
            element++

        } 

        }).get();

    window.api.invoke('save_json', JSON.stringify(form))
        .then(function(res) {
            console.log(res); // will print "This worked!" to the browser console
        }).catch(function(err) {
            console.error(err); // will print "This didn't work!" to the browser console.
        });

    //console.log("Proposal Header: ", $("")[0]) 
    //console.log("SCRIPT: ", $("script"))
}

