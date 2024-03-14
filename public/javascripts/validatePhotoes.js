const image = document.getElementById('images');

image.addEventListener('change', function(e){
    let size = image.files.length;
    console.log(size);
    if(size > 2){
        window.alert("Maximum allowed photoes is 2");
        image.value = "";
    }
    
    for(let img of images.files){
        if(img.size > 5e+6){
            window.alert("Photo size should be less than 5mb");
            image.value = "";
        }
    }
})

