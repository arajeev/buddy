function requestTopPost() {
    url = "https://www.kimonolabs.com/api/41mi0ghm?apikey=ipemug0Wsffq19Kl4Y1YOd97ERjGMFF2"
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
        if (xhr.readyState == 4 && xhr.status == 200) {
            data = JSON.parse(xhr.responseText);
            stories = data.results.collection1;
            stories.forEach(function(e) {
                if(e.index == 1) {
                    console.log(e.title.text);
                    sendMessage(e.title.text);
                }
            });
        }
    };
    xhr.open('GET', url);
    xhr.send();
}

function sendMessage(message) {
    Pebble.sendAppMessage({"title": message});
}

Pebble.addEventListener("ready",
    function(e) {
        console.log("Hello world! - Sent from your javascript application.");
    }
);

Pebble.addEventListener("appmessage",
    function(e) {
        console.log("Received message: " + e.payload.greeting);
        requestTopPost();
    }
);
