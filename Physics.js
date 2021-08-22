import Matter from 'matter-js'
import Constants from './Constants';
import Pipe from './Pipe'
import PipeTop from './PipeTop'

let tick = 0;
let pose = 1
let pipes = 0

export const randomBetween = (min, max) => {
    // lấy số min + với range random (VD: 200) => giá trị y (VD: -340)
    return Math.floor(Math.random() * (max - min + 1) + min)
}

export const resetPipes = () => {
    pipes = 0
}
export const generatePipes = () => {
    let topPipeHeight = randomBetween(100, (Constants.MAX_HEIGHT / 2) - 100)
    let bottomPipeHeight = Constants.MAX_HEIGHT - topPipeHeight - Constants.GAP_SIZE

    let sizes = [topPipeHeight, bottomPipeHeight]

    if (Math.random() < 0.5) {
        sizes = sizes.reverse() 
    }

    return sizes;
}

export const addPipesAtLocation = (x, world, entities) => {
    let [pipe1Height,pipe2Height] = generatePipes()

    let pipeTopWidth = Constants.PIPE_WIDTH + 20
    let pipeTopHeight = (pipeTopWidth / 205) * 95

    pipe1Height = pipe1Height - pipeTopHeight

    let pipe1Top = Matter.Bodies.rectangle(
        x,
        pipe1Height + (pipeTopHeight / 2),
        pipeTopWidth,
        pipeTopHeight,
        {isStatic: true}
    )

    let pipe1 = Matter.Bodies.rectangle(
        x,
        pipe1Height / 2,
        Constants.PIPE_WIDTH,
        pipe1Height,
        {isStatic: true}
    )

    pipe2Height = pipe2Height - pipeTopHeight

    let pipe2Top = Matter.Bodies.rectangle(
        x,
        Constants.MAX_HEIGHT - 50 - pipe2Height - (pipeTopHeight / 2),
        pipeTopWidth,
        pipeTopHeight,
        {isStatic: true}
    )

    let pipe2 = Matter.Bodies.rectangle(
        x,
        Constants.MAX_HEIGHT - 50 - (pipe2Height / 2),
        Constants.PIPE_WIDTH,
        pipe2Height,
        {isStatic: true}    
    )

    Matter.World.add(world, [pipe1, pipe1Top, pipe2, pipe2Top])

    entities["pipe" + (pipes + 1)] = {
        body: pipe1, renderer: Pipe, scored: false
    }
    entities["pipe" + (pipes + 2)] = {
        body: pipe2, renderer: Pipe, scored: false
    }
    entities["pipe" + (pipes + 1) + "Top"] = {
        body: pipe1Top, renderer: PipeTop, scored: false
    }
    entities["pipe" + (pipes + 2) + "Top"] = {
        body: pipe2Top, renderer: PipeTop, scored: false
    }

    pipes +=2 

}

const Physics = function(entities, {touches, time, dispatch }){
    let engine = entities.physics.engine;
    let world = entities.physics.world
    let bird = entities.bird.body

    let hadTouches = false

    touches.filter(t => t.type === "press").forEach(t => {
        if (!hadTouches) {
            if (world.gravity.y === 0) {
                world.gravity.y = 1.0

                addPipesAtLocation((Constants.MAX_WIDTH * 1.5) - (Constants.PIPE_WIDTH / 2), world, entities)
                addPipesAtLocation((Constants.MAX_WIDTH * 2.5) - (Constants.PIPE_WIDTH / 2), world, entities)
            }
            hadTouches = true
            Matter.Body.setVelocity(bird, {
                x: bird.velocity.x,
                y: -12
            })
        }
    })

    Matter.Engine.update(engine, time.delta)

    Object.keys(entities).forEach(key => {
        if (key.indexOf("pipe") === 0 && entities.hasOwnProperty(key)) {
            Matter.Body.translate(entities[key].body, {x:-2,y:0})

            if(key.indexOf("Top") !== -1 && parseInt(key.replace("pipe", "")) % 2 === 0) {
                if (entities[key].body.position.x <= bird.position.x  && !entities[key].scored) {
                    entities[key].scored = true
                    dispatch({ type: "score"})
                }
                

                if (entities[key].body.position.x <= -1 * (Constants.PIPE_WIDTH / 2)) {
                    let pipeIdx = parseInt(key.replace("pipe", ""))
                    delete(entities["pipe" + (pipeIdx-1) + "Top"])
                    delete(entities["pipe" + (pipeIdx-1)])
                    delete(entities["pipe" + (pipeIdx + "Top")])
                    delete(entities["pipe" + pipeIdx])

                    addPipesAtLocation((Constants.MAX_WIDTH * 2) - (Constants.PIPE_WIDTH / 2), world, entities)
                }
            }
        } else if(key.indexOf("floor") === 0) {
                // Max width ở đây là 1.5 width màn hình, nếu quá sàn chạy quá nửamàn hình thì đảo lại vị trí cho nó 
                // Về giữa màn hình tiếp theo
                if (entities[key].body.position.x <= -1 * Constants.MAX_WIDTH / 2) {
                    Matter.Body.setPosition(entities[key].body, {
                        x:Constants.MAX_WIDTH + (Constants.MAX_WIDTH / 2),
                        y: entities[key].body.position.y
                    })
                } else {
                    Matter.Body.translate(entities[key].body, {x:-2,y:0})
                }
            }
        }
    )

    tick += 1;
    if (tick % 5 === 0) {
        pose = pose + 1
        if (pose > 3) {
            pose = 1
        }
        entities.bird.pose = pose
    }

    return entities
}

export default Physics