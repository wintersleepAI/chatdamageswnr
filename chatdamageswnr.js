// This code was modelled on chatdamagebuttons5e.js

class ChatDamageButtonsSWNR extends Application {
    constructor(app) {
        super(app);
    }

    init () {

        Hooks.on('renderChatMessage', (message, html, data) => {            
            if ( !message.isRoll) return
            
            let len = message.roll.dice.length;      
            // If there are 2 rolls, use the second. else take first      
            let total = 0;
            if (len == 0) {
                // Shock Damage with no roll
                total = message.roll.total;
            } else if (len == 1) {
                total = message.roll.dice[0].total;
            } else if (len == 2) {
                total = message.roll.dice[1].total;
            } else {
                console.log("Unknown roll. Not trying to set damage button", message);
                return;
            }
            if (total == 0)  return;

            let btnStyling = 'width: 22px; height:22px; font-size:10px;line-height:1px';

            const fullDamageButton = $(`<button class="dice-total-fullDamage-btn" style="${btnStyling}"><i class="fas fa-user-minus" title="Click to apply full damage to selected token(s)."></i></button>`);
            // const halfDamageButton = $(`<button class="dice-total-halfDamage-btn" style="${btnStyling}"><i class="fas fa-user-shield" title="Click to apply half damage to selected token(s)."></i></button>`);
            // const doubleDamageButton = $(`<button class="dice-total-doubleDamage-btn" style="${btnStyling}"><i class="fas fa-user-injured" title="Click to apply double damage to selected token(s)."></i></button>`);
            const fullHealingButton = $(`<button class="dice-total-fullHealing-btn" style="${btnStyling}"><i class="fas fa-user-plus" title="Click to apply full healing to selected token(s)."></i></button>`);

            const btnContainer = $('<span class="dmgBtn-container" style="position:absolute; right:0; bottom:1px;"></span>');
            btnContainer.append(fullDamageButton);
            // btnContainer.append(halfDamageButton);
            // btnContainer.append(doubleDamageButton);
            btnContainer.append(fullHealingButton);
            //console.log()

            //Find the first or second div to append the button to
            html.find('.dice-total').slice(len-1).append(btnContainer);

            // Handle button clicks
            fullDamageButton.click(ev => {
                ev.stopPropagation();
                applyHealthDrop(total);
                //CONFIG.Actor.entityClass.applyDamage(html, 1);
            });
            
            // halfDamageButton.click(ev => {
            //     ev.stopPropagation();
            // applyHealthDrop(total*0.5);
            // });

            // doubleDamageButton.click(ev => {
            //     ev.stopPropagation();
            // applyHealthDrop(total*2);
            // });

            fullHealingButton.click(ev => {
                ev.stopPropagation();
                applyHealthDrop(total*-1);
            });
        
        
        });
    }
}

async function applyHealthDrop(total) {
    let actors = canvas.tokens.controlled.map(token => {return token.actor});
    if(actors.length == 0){
      ui.notifications.error("Please select at least one token")
      return;
    }
    console.log(`Applying health drop ${total} to ${actors.length} selected tokens`);

    for (let actor of actors){
        let newHealth = actor.data.data.health.value - total;
        if (newHealth < 0) {
            newHealth = 0;
        } else if (newHealth > actor.data.data.health.max)  {
            newHealth = actor.data.data.health.max;
        }
        console.log(`Updating ${actor.name} health to ${newHealth}`);
        actor.update({"data.health.value": newHealth});
    }
}

let chatButtons = new ChatDamageButtonsSWNR();
chatButtons.init();