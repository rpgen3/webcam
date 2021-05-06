let isLoaded = false;
const Photo = 0,
      Video = 1;
let mode = Photo;
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
let stream;
const disabled = b => $("button").attr("disabled",b);
$("<button>").appendTo(h).text("カメラの許可").on("click", async()=>{
    disabled(true);
    try {
        stream = await navigator.mediaDevices.getUserMedia({
            width, height,
            video: isFront() ? "user" : {facingMode: "environment"},
            audio: true
        });
        video.srcObject = stream;
        video.muted = true;
        setTimeout(()=>$(cv).attr({
            width: video.videoWidth,
            height: video.videoHeight
        }),500);
    } catch (err) {
        disabled(false);
        return msg(err, true);
    }
    disabled(false);
});
$("<button>").appendTo(h).text("撮影").on("click",()=>{
    img.attr("src", cv.toDataURL('image/png'));
    mode = Photo;
});
const isNowREC = rpgen3.addInputBool(h,{
    title: "録画",
    change: v => {
        if(!isLoaded || !stream) return false;
        REC[v ? 'start' : 'stop']();
    }
});
$("<button>").appendTo(h).text("再生").on("click", () => REC.play());
$("<button>").appendTo(h).text("保存").on("click", ()=>{
    const b = mode === Photo;
    $("<a>").attr({
        href: b ? img.attr("src") : videoREC.src,
        download: b ? 'webcam.png' : 'webcam.webm'
    }).get(0).click();
});
$("<h3>").appendTo(h).text("<video>");
const makeVideo = () => $("<video>").appendTo(h).attr({ autoplay: true }).get(0),
      video = makeVideo(),
      videoREC = makeVideo();
const cv = $("<canvas>").attr({width, height}).get(0),
      ctx = cv.getContext('2d');
(function update(){
    ctx.drawImage(video, 0, 0);
    setTimeout(update, 10);
})();
const REC = (()=>{
    let blobs, mREC, blobURL;
    return {
        start: ()=>{
            blobs = [];
            mREC = new MediaRecorder(stream, {
                mimeType: "video/webm;codecs=vp9"
            });
            mREC.ondataavailable = () => event.data && event.data.size > 0 ? blobs.push(event.data) : null;
            mREC.start(10);
        },
        stop: ()=>{
            mREC.stop();
            blobURL = window.URL.createObjectURL(new Blob(blobs, {
                type: "video/webm"
            }));
            mode = Video;
        },
        play: ()=>{
            if(isNowREC()) return msg("録画中です", true);
            else msg("録画を再生します");
            videoREC.src = blobURL;
            videoREC.controls = true;
        }
    }
})();
$("<h3>").appendTo(h).text("<img>");
const img = $("<img>").appendTo(h);
isLoaded = true;
