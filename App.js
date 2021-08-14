/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, { Component } from 'react';
import Bird from './Bird';
import Physics from './Physics';
import Wall from './Wall';
import Floor from './Floor';
import Constants from './Constants';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import Matter from 'matter-js';
import { GameEngine } from 'react-native-game-engine';

export const randomBetween = (min, max) => {
  // lấy số min + với range random (VD: 200) => giá trị y (VD: -340)
  return Math.floor(Math.random() * (max - min + 1) + min)
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

export default class App extends Component {
  constructor(props) {
    super(props);
    this.gameEngine = null;
    this.entities = this.setupWorld();

    this.state = {
      running: true
    }
  }


  setupWorld = () => {
    let engine = Matter.Engine.create({ enableSleeping: false });
    let world = engine.world;

    let bird = Matter.Bodies.rectangle(Constants.MAX_WIDTH / 4,Constants.MAX_HEIGHT / 2,50,50,);
    let floor = Matter.Bodies.rectangle(Constants.MAX_WIDTH / 2,Constants.MAX_HEIGHT - 48,Constants.MAX_WIDTH,50,{ isStatic: true });
    let ceiling = Matter.Bodies.rectangle(Constants.MAX_WIDTH / 2,25,Constants.MAX_WIDTH,50,{ isStatic: true });
    
    let [pipe1Height, pipe2Height] = generatePipes() 

    let pipe1 = Matter.Bodies.rectangle(Constants.MAX_WIDTH - (Constants.PIPE_WIDTH / 2), pipe1Height / 2 ,Constants.PIPE_WIDTH,pipe1Height,{ isStatic: true });
    let pipe2 = Matter.Bodies.rectangle(Constants.MAX_WIDTH - (Constants.PIPE_WIDTH / 2), Constants.MAX_HEIGHT - (pipe2Height / 2) ,Constants.PIPE_WIDTH,pipe2Height,{ isStatic: true });
    
    let [pipe3Height, pipe4Height] = generatePipes() 
    let pipe3 = Matter.Bodies.rectangle(Constants.MAX_WIDTH * 2 - (Constants.PIPE_WIDTH / 2), pipe3Height / 2 ,Constants.PIPE_WIDTH,pipe3Height,{ isStatic: true });
    let pipe4 = Matter.Bodies.rectangle(Constants.MAX_WIDTH * 2 - (Constants.PIPE_WIDTH / 2), Constants.MAX_HEIGHT - (pipe4Height / 2) ,Constants.PIPE_WIDTH,pipe4Height,{ isStatic: true });

    Matter.World.add(world, [bird, floor, ceiling, pipe1, pipe2, pipe3, pipe4]);


    Matter.Events.on(engine, "collisionStart", (event) => {
       let pairs = event.pairs

       this.gameEngine.dispatch({type: "game-over"})
    })

    return {
      physics: { engine: engine, world: world },
      bird: { body: bird, size: [50, 50], console: 'red', renderer: Bird },
      floor: { body: floor, size: [Constants.MAX_WIDTH, 50], console: 'green', renderer: Wall },
      ceiling: {
        body: ceiling,
        size: [Constants.MAX_WIDTH, 50],
        console: 'green',
        renderer: Wall,
      },
      pipe1: { body: pipe1, size: [Constants.PIPE_WIDTH, pipe1Height], console: 'green', renderer: Wall },
      pipe2: { body: pipe2, size: [Constants.PIPE_WIDTH, pipe2Height], console: 'green', renderer: Wall },
      pipe3: { body: pipe3, size: [Constants.PIPE_WIDTH, pipe3Height], console: 'green', renderer: Wall },
      pipe4: { body: pipe4, size: [Constants.PIPE_WIDTH, pipe4Height], console: 'green', renderer: Wall },
    };
  };

  onEvent = (e) => {
    if(e.type === "game-over") {
      this.setState({
        running: false
      })
    }
  }

  reset = () => {
    this.gameEngine.swap(this.setupWorld())
    this.setState({
      running: true
    })
  }

  render(h) {
    return (
      <View style={styles.container}>
        <GameEngine
          ref={ref => {
            this.gameEngine = ref;
          }}
          running={this.state.running}
          style={styles.gameContainer}
          onEvent={this.onEvent}
          systems={[Physics]}
          entities={this.entities}>
        </GameEngine>
        {!this.state.running && <TouchableOpacity onPress={this.reset} style={styles.fullScreenButton}>
          <View style={styles.fullScreen}>
            <Text style={styles.gameOverText}>Game Over</Text>
          </View>
        </TouchableOpacity>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff'
  },
  gameContainer: {
    position: 'absolute', 
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  fullScreenButton: {
    position: 'absolute', 
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    flex: 1
  },
  fullScreen: {
    position: 'absolute', 
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'black',
    opacity: 0.8,
    justifyContent: 'center',
    alignItems: 'center'
  },
  gameOverText: {
    color:'white',
    fontSize: 48
  }
});
