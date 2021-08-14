import Matter from 'matter-js'
import Constants from './Constants';

const Physics = function(entities, {touches, time }){
    let engine = entities.physics.engine;

    let bird = entities.bird.body

    touches.filter(t => t.type === "start").forEach(t => {
        Matter.Body.applyForce(bird, bird.position, {
            x: 0.0, y: -0.1
        })
    })

    for (let index = 1; index < 5; index++) {
        if (entities["pipe" + index].body.position.x <= -1 * (Constants.PIPE_WIDTH / 2)) {
            Matter.Body.setPosition(entities["pipe" + index].body, {x:Constants.MAX_WIDTH * 2 - (Constants.PIPE_WIDTH / 2), y: entities["pipe" + index].body.position.y})
        } else {
            Matter.Body.translate(entities["pipe" + index].body, {x: -1, y: 0})
        }
        
    }

    Matter.Engine.update(engine, time.delta)

    return entities
}

export default Physics