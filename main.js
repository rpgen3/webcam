const { $, rpgen3 } = window;
const h = $("<div>").appendTo($("body")).css({
    "text-align": "center",
    padding: "1em"
});
$("<h1>").appendTo(h).text("webカメラのサンプル");
const hMsg = $("<div>").appendTo(h);
function msg(str, isError){
    $("<span>").appendTo(hMsg.empty()).text(str).css({
        color: isError ? 'red' : 'blue',
        backgroundColor: isError ? 'pink' : 'lightblue'
    })
}
const isFront = rpgen3.addInputBool(h,{
    title: "前面カメラを使用"
});
const {width, height} = {
    width: 640,
    height: 480,
};
$("<button>").appendTo(h).text("カメラの許可").on("click",()=>{
    navigator.mediaDevices.getUserMedia({
        width, height,
        video: isFront() ? "user" : {facingMode: "environment"},
        audio: true
    }).then(stream => {
        video.srcObject = stream;
    }).catch(err => {
        msg(err, true);
    });
});
$("<button>").appendTo(h).text("撮影").on("click",()=>{
    $("<a>").attr({
        href: cv.toDataURL('image/png'),
        download: 'webcam.png'
    }).get(0).click();
});
$("<h3>").appendTo(h).text("<video>");
const video = $("<video>").appendTo(h).attr({
    autoplay: true
}).get(0);
const updateTime = rpgen3.addSelect(h,{
    title: "canvas描画間隔[ms]",
    list: [
        0,
        10,
        100,
        500,
        1000,
        2000
    ],
    value: 100
})
$("<h3>").appendTo(h).text("<canvas>");
const cv = $("<canvas>").appendTo(h).attr({width, height}).get(0),
      ctx = cv.getContext('2d');
(function update(){
    $(cv).attr({
        width: video.videoWidth,
        height: video.videoHeight
    });
    ctx.drawImage(video, 0, 0);
    setTimeout(update, updateTime());
})();
