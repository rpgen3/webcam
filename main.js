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
const getStream = () => navigator.mediaDevices.getUserMedia({
    width, height,
    video: isFront() ? "user" : {facingMode: "environment"},
    audio: true
});
const disabled = b => $("button").attr("disabled",b);
$("<button>").appendTo(h).text("カメラの許可").on("click", async()=>{
    disabled(true);
    try {
        const stream = await getStream();
        const video = makeVideo();
        video.srcObject = stream;
        resizeCv(video);

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
        if(isLoaded) REC[v ? 'start' : 'stop']();
    }
});
$("<button>").appendTo(h).text("再生").on("click", () => REC.play());
$("<button>").appendTo(h).text("保存").on("click", ()=>{
    const b = mode === Photo;
    $("<a>").attr({
        href: b ? img.attr("src") : hVideo.find("video").attr("src"),
        download: b ? 'webcam.png' : 'webcam.webm'
    }).get(0).click();
});
$("<h3>").appendTo(h).text("<video>");
const hVideo = $("<div>").appendTo(h);
const makeVideo = () => $("<video>").appendTo(hVideo.empty()).attr({
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
});
const cv = $("<canvas>").attr({width, height}).get(0),
      ctx = cv.getContext('2d');
function resizeCv(video){
    $(cv).attr({
        width: video.videoWidth,
        height: video.videoHeight
    });
}
(function update(){
    const video = hVideo.find("video").get(0);
    if(video) ctx.drawImage(video, 0, 0);
    setTimeout(update, updateTime());
})();
const REC = (()=>{
    let blobs, mREC, blobURL;
    return {
        start: async()=>{
            disabled(true);
            blobs = [];
            try {
                const stream = await getStream();
                const video = makeVideo();
                video.srcObject = stream;
                resizeCv(video);
                video.muted = true;
                mREC = new MediaRecorder(stream, {
                    mimeType: "video/webm;codecs=vp9"
                });
            } catch (err) {
                disabled(false);
                return msg(err, true);
            }
            disabled(false);
            mREC.ondataavailable = () => event.data && event.data.size > 0 ? blobs.push(event.data) : null;
            mREC.start(Number(updateTime()));
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
            const video = makeVideo();
            video.src = blobURL;
            video.controls = true;
        }
    }
})();
$("<h3>").appendTo(h).text("<img>");
const img = $("<img>").appendTo(h);
isLoaded = true;
