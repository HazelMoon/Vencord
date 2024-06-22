import { addContextMenuPatch, findGroupChildrenByChildId, NavContextMenuPatchCallback, removeContextMenuPatch } from "@api/ContextMenu";
import definePlugin from "@utils/types";
import { Menu } from "@webpack/common";
import { Guild } from "discord-types/general";

const Patch: NavContextMenuPatchCallback = (children, { guild }: { guild: Guild; }) => () => {
    const group = findGroupChildrenByChildId("privacy", children);

    group?.push(
        <Menu.MenuItem
            id="vc-emoji-download"
            label="Download Emojis"
            action={() =>
                 zipServerEmojis(guild.id, guild.name)}
        />
    );
};

export default definePlugin({
    name: "Emoji Download",
    description: "Allows you to download a servers emojis as a zip file.",
    authors: [
        {
            id: 976176454511509554n,
            name: "Samwich",
        },
    ],
    start() {
        addContextMenuPatch(["guild-context", "guild-header-popout"], Patch);
    },

    stop() {
        removeContextMenuPatch(["guild-context", "guild-header-popout"], Patch);
    }
});

async function zipServerEmojis(id, name) {
    await fetch("https://unpkg.com/fflate@0.8.0").then(r => r.text()).then(eval);
    const emojis = Vencord.Webpack.Common.EmojiStore.getGuilds()[id]?.emojis;
    if (!emojis) {
        return console.log("Server not found!");
    }

    const fetchEmojis = async e => {
        const filename = e.id + (e.animated ? ".gif" : ".png");
        const emoji = await fetch("https://cdn.discordapp.com/emojis/" + filename + "?size=512&quality=lossless").then(res => res.blob());
        return { file: new Uint8Array(await emoji.arrayBuffer()), filename };
    };    
    const emojiPromises = emojis.map(e => fetchEmojis(e));

    Promise.all(emojiPromises)
        .then(results => {
            const emojis = fflate.zipSync(Object.fromEntries(results.map(({ file, filename }) => [filename, file])));
            const blob = new Blob([emojis], { type: "application/zip" });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${name}-emojis.zip`;
            link.click();
            link.remove();
        })
        .catch(error => {
            console.error(error);
        });
}