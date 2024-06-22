
import { Devs } from "@utils/constants";
import definePlugin, { OptionType } from "@utils/types";
import { UserStore } from "@webpack/common";

export default definePlugin({
    name: "SelfShopPreview",
    description: "Adds your own profile picture to the decorations in the shop",
    
    authors:
    [
        Devs.Samwich
    ],
    
    patches: [
        {
            find: "className:G.avatarContainer,",
            replacement: {
                match: /src:er,/,
                replace: 'src:$self.avatarUrl(),'
            }
        }
    ],
    avatarUrl: GetAvatarUrl
    
});
    
function GetAvatarUrl()
{
    return UserStore.getCurrentUser().getAvatarURL();
}