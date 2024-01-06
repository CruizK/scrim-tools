import NodeMediaServer from "node-media-server";
import ffmpegStatic from "ffmpeg-static";
import fs from "fs"

const nms = new NodeMediaServer(
    {
        rtmp: {
            port: 1935,
            chunk_size: 60000,
            gop_cache: true,
            ping: 30,
            ping_timeout: 60
        },
        http: {
            mediaroot: "./media",
            port: 8000,
            allow_origin: "*"
        },
        trans: {
            ffmpeg: ffmpegStatic || "",
            tasks: [{
                app: "live",
                mp4: true,
                mp4Flags: '[movflags=frag_keyframe+empty_moov]'
            }]
        }
    }
)

nms.on('doneConnect', (id, args) => {
    console.log('[NodeEvent on doneConnect]', `id=${id} args=${JSON.stringify(args)}`);
});


nms.on("postPublish", async (id, streamPath, args) => {
    console.log('[NodeEvent on postPublish]', `id=${id} streamPath=${streamPath} args=${JSON.stringify(args)}`);
})

nms.run();

console.log("Hello World");
