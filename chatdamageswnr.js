/* eslint-disable prettier/prettier */
// This code was modelled on chatdamagebuttons5e.js

class ChatDamageButtonsSWNR extends Application {
    constructor(app) {
        super(app);
    }

    init () {

        Hooks.on('renderChatMessage', (message, html, data) => {            
            if ( !message.isRoll) return;
            
            let len = message.roll.terms[0].results.length;
            // If there are 2 rolls, use the second. else take first      
            let total = 0;
            let shock = null;
            if (len == 0) {
                // Shock Damage with no roll
                total = message.roll.total;
            } else if (len == 1) {
                total = message.roll.terms[0].results[0].result;
            } else if (len == 2) {
                total = message.roll.terms[0].results[1].result;
            } else if (len == 3) {
                total = message.roll.terms[0].results[1].result;
                shock = message.roll.terms[0].results[2].result;
            } else {
                console.log("Unknown roll. Not trying to set damage button", message);
                return;
            }
            if (total == 0)  return;

            let btnStyling = 'width: 22px; height:22px; font-size:10px;line-height:1px';

            const fullDamageButton = $(`<button class="dice-total-fullDamage-btn" style="${btnStyling}"><i class="fas fa-user-minus" title="Click to apply full damage (${total}) to selected token(s)."></i></button>`);
            // const halfDamageButton = $(`<button class="dice-total-halfDamage-btn" style="${btnStyling}"><i class="fas fa-user-shield" title="Click to apply half damage to selected token(s)."></i></button>`);
            // const doubleDamageButton = $(`<button class="dice-total-doubleDamage-btn" style="${btnStyling}"><i class="fas fa-user-injured" title="Click to apply double damage to selected token(s)."></i></button>`);
            const fullHealingButton = $(`<button class="dice-total-fullHealing-btn" style="${btnStyling}"><i class="fas fa-user-plus" title="Click to apply full healing (${total}) to selected token(s)."></i></button>`);

            const btnContainer = $('<span class="dmgBtn-container" style="position:absolute; right:0; bottom:1px;"></span>');
            btnContainer.append(fullDamageButton);
            // btnContainer.append(halfDamageButton);
            // btnContainer.append(doubleDamageButton);
            btnContainer.append(fullHealingButton);
            //console.log()

            //Find the first or second div to append the button to
            if (shock == null){
                html.find('.dice-total').slice(len-1, len).append(btnContainer);
            } else {
                // shock is last, need to put at 2nd to last
                html.find('.dice-total').slice(len-2, len-1).append(btnContainer);
            }

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

            if (shock) {
                const shockFullDamageButton = $(`<button class="dice-total-fullDamage-btn" style="${btnStyling}"><i class="fas fa-user-minus" title="Click to apply full shock damage (${shock}) to selected token(s)."></i></button>`);
                const shockFullHealingButton = $(`<button class="dice-total-fullHealing-btn" style="${btnStyling}"><i class="fas fa-user-plus" title="Click to apply full shock healing (${shock}) to selected token(s)."></i></button>`);

                const shockbtnContainer = $('<span class="dmgBtn-container" style="position:absolute; right:0; bottom:1px;"></span>');
                shockbtnContainer.append(shockFullDamageButton);
                shockbtnContainer.append(shockFullHealingButton);
                html.find('.dice-total').slice(len-1).append(shockbtnContainer);

                // Handle button clicks
                shockFullDamageButton.click(ev => {
                    ev.stopPropagation();
                    applyHealthDrop(shock);
                });

                shockFullHealingButton.click(ev => {
                    ev.stopPropagation();
                    applyHealthDrop(shock*-1);
                });
            }
        
        
        });
    }
}

async function applyHealthDrop(total) {
    let actors = canvas.tokens.controlled.map(token => {return token.actor;});
    if(actors.length == 0){
      ui.notifications.error("Please select at least one token");
      return;
    }
    //console.log(`Applying health drop ${total} to ${actors.length} selected tokens`);

    for (let actor of actors){
        let newHealth = actor.data.data.health.value - total;
        if (newHealth < 0) {
            newHealth = 0;
        } else if (newHealth > actor.data.data.health.max)  {
            newHealth = actor.data.data.health.max;
        }
        //console.log(`Updating ${actor.name} health to ${newHealth}`);
        await actor.update({"data.health.value": newHealth});
    }
}

let chatButtons = new ChatDamageButtonsSWNR();
chatButtons.init();
