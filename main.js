const { $, rpgen3 } = window;
const h = $("<div>").appendTo($("body")).css({
    "text-align": "center",
    padding: "1em"
});
$("<h1>").appendTo(h).text("webカメラの実験");
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
let stream;
const disabled = b => $("button").attr("disabled",b);
$("<button>").appendTo(h).text("カメラの許可").on("click", async()=>{
    disabled(true);
    try {
        if(stream) stream.getTracks().forEach(track => track.stop());
        stream = await navigator.mediaDevices.getUserMedia({
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
    img.src = cv.toDataURL('image/png');
});
const isNowREC = rpgen3.addInputBool(h,{
    title: "録画",
    change: v => {
        if(!stream) return false;
        REC[v ? 'start' : 'stop']();
    }
});
$("<button>").appendTo(h).text("再生").on("click", () => REC.play());
const DL = (href, download) => $("<a>").attr({ href, download }).get(0).click();
$("<h3>").appendTo(h).text("<video>");
const makeVideo = () => $("<video>").appendTo(h).attr({ autoplay: true }).get(0),
      video = makeVideo(),
      videoREC = makeVideo();
$("<button>").appendTo(h).text("動画を保存").on("click",()=>DL(videoREC.src, 'webcam.webm'));
const cv = $("<canvas>").get(0),
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
const img = $("<img>").appendTo(h).get(0);
$("<button>").appendTo(h).text("画像を保存").on("click",()=>DL(img.src, 'webcam.png'));
