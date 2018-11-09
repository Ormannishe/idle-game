var beatInterval;
var tickInterval;
var beatAnimationDirection = "up";

function toggleItemTab(evt, tab) {
	// TODO: Add tab content for money generating resources (ie. songs, albums, brand, other media/products)
    var tabContent, activeTabs;

    // Hide all tabcontent
    tabContent = document.getElementsByClassName("tabcontent");

    for (var i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }

    // Set the active tab to non-active
    activeTabs = document.getElementsByClassName("active-tab")

    for (var i = 0; i < activeTabs.length; i++) {
    	activeTabs[i].className = "tab";
    }

    // Show the new tab content, and make the new tab 'active'
    document.getElementById(tab).style.display = "block";
    evt.currentTarget.className = "active-tab";
}

function animateBeat() {
    // TODO: Make animation less awful
    // TODO: Put images on sprite sheet
    // TODO: Make animation direction not backwards (ie. reverse file numbering)
    // TODO: Track Current Image Number - beats must be gathered on certain frame(s)
    var beatImg = document.getElementById("beatImg");
    var currImgNumber = parseInt(beatImg.src.replace(/[^0-9]/g, ''));
    var nextImg;

    // If you've reached the final image, reverse the animation direction and wait briefly before triggering the next animation.
    if (currImgNumber >= 16) {
        beatAnimationDirection = "down";
        clearInterval(beatInterval);
        setTimeout(function(){beatInterval = setInterval(animateBeat, 15);}, 800)

    }
    else if (currImgNumber <= 1) {
        beatAnimationDirection = "up";
    }

    if (beatAnimationDirection == "up")
        nextImg = "images/digital-sound-display" + (currImgNumber + 1) + ".png";
    else if (beatAnimationDirection == "down")
        nextImg = "images/digital-sound-display" + (currImgNumber - 1) + ".png";

    beatImg.src = nextImg;
}

function naturalTick() {
    if (activeTask != undefined) {
        var progress = document.getElementById('taskProgress');
        updateProgress(progress, (progress.value + 1), progress.max, taskCompleteFn);
    }

    updateView();
}

function startAnimations() {
    beatInterval = setInterval(animateBeat, 10);
    tickInterval = setInterval(naturalTick, 1000);
}