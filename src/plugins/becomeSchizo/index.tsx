/*
 * Vencord, a modification for Discord's desktop app
 * Copyright (c) 2023 Vendicated and contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

/* eslint-disable no-useless-escape */

import { Devs } from "@utils/constants";
import definePlugin from "@utils/types";
import { EmojiStore, GuildStore, Tooltip } from "@webpack/common";
import { CustomEmoji } from "@webpack/types";

const emojis: CustomEmoji[] = [];

function randomize(content: any[]) {

    for (let i = content.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [content[i], content[j]] = [content[j], content[i]];
    }

    content = content.map(part => {
        if (part.type === "span") {
            part.props.children = part.props.children.split(" ").sort(() => Math.random() - 0.5).join(" ");

            const words = part.props.children.split(" ");
            const wordCount = Math.floor(Math.random() * words.length / 2);

            for (let i = 0; i < wordCount; i++) {
                const word = words[i];
                const letters = word.split("");
                for (let i = letters.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [letters[i], letters[j]] = [letters[j], letters[i]];
                }
                words[i] = letters.join("");
            }

            part.props.children = words.join(" ");
        }

        return part;
    });

    const emojiCount = Math.floor(Math.random() * content.length / 2);

    for (let i = 0; i < emojiCount; i++) {
        const emoji = emojis[Math.floor(Math.random() * emojis.length)];
        content.splice(Math.floor(Math.random() * content.length), 0, (
            <Tooltip text={emoji.name}>
                {({ onMouseEnter, onMouseLeave }) => (
                    <span onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} className="emojiContainer__4a804 emojiContainerClickable__55a4f" aria-expanded={false} role="button" tabIndex={0}>
                        <img aria-label={`:${emoji.name}:`} src={emoji.url} alt={`:${emoji.name}:`} draggable={false} className="emoji" datatype="emoji" data-id={emoji.id} />
                    </span>
                )}
            </Tooltip>
        ));
    }

    return content;
}

export default definePlugin({
    name: "Become Schizo",
    authors: [(Devs.Tolgchu ?? { name: "✨Tolgchu✨", id: 329671025312923648n })],
    description: "Randomizes all message contents.",
    patches: [
        {
            find: ".Messages.MESSAGE_EDITED,",
            replacement: [
                {
                    match: /let\{className:\i,message:\i[^}]*\}=(\i)/,
                    replace: "if($1&&$1.message&&$1.message.content)$1.content=$self.randomize($1.content);$&"
                }
            ]
        }
    ],
    randomize,
    start: () => {
        const guilds = Object.values(GuildStore.getGuilds());

        for (const guild of guilds) {
            emojis.push(...EmojiStore.getGuildEmoji(guild.id).filter(emoji => emoji));
        }
    },
    stop: () => { }
});
