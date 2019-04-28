/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  Dimensions,
  View,
  ImageBackground,
  TouchableOpacity,
  BackHandler,
  ToastAndroid
} from "react-native";

import Icon from "react-native-vector-icons/MaterialIcons";

import { RNCamera } from "react-native-camera";

let PicturePath = "";

const PendingView = () => (
  <View
    style={{
      flex: 1,
      backgroundColor: "lightgreen",
      justifyContent: "center",
      alignItems: "center"
    }}
  >
    <Text>Waiting</Text>
  </View>
);

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cameraType: "front",
      mirrorMode: true,
      image: null,
      loading: false,
      faces: [],
      isFaceDetected: false
    };

    this.handleBackButton = this.handleBackButton.bind(this);
  }

  componentDidMount() {
    BackHandler.addEventListener("hardwareBackPress", this.handleBackButton);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener("hardwareBackPress", this.handleBackButton);
  }

  handleBackButton() {
    ToastAndroid.show("Back button is pressed", ToastAndroid.SHORT);
    this.setState({ image: null, backButton: false });
    return true;
  }

  backButton() {
    console.log("clicked");
    this.setState({ image: null, isFaceDetected: false });
  }

  changeCameraType() {
    if (this.state.cameraType === "back") {
      this.setState({
        cameraType: "front",
        mirrorMode: true
      });
    } else {
      this.setState({
        cameraType: "back",
        mirrorMode: false
      });
    }
  }

  storePicture() {
    if (PicturePath) {
      // Create the form data object
      var data = new FormData();
      data.append("picture", {
        uri: PicturePath,
        name: "selfie.jpg",
        type: "image/jpg"
      });

      // Create the config object for the POST
      // You typically have an OAuth2 token that you use for authentication
      const config = {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data;",
          Authorization: "Bearer " + "SECRET_OAUTH2_TOKEN_IF_AUTH"
        },
        body: data
      };

      fetch("https://postman-echo.com/post", config)
        .then(responseData => {
          // Log the response form the server
          // Here we get what we sent to Postman back
          console.log(responseData);
        })
        .catch(err => {
          console.log(err);
        });
    }
  }

  async takePicture() {
    this.setState({
      loading: true
    });

    if (this.camera) {
      const options = {
        quality: 0.5,
        base64: true,
        mirrorImage: this.state.mirrorMode ? true : false,
        fixOrientation: true,
        forceUpOrientation: true
      };
      const data = await this.camera.takePictureAsync(options);
      PicturePath = data.path;
      this.setState({ image: data.uri });
      console.log(data.uri);
    }
  }

  onFacesDetected = ({ faces }) => {
    console.log(faces, "faces");
    this.setState({ isFaceDetected: true });
  };

  onFaceDetectionError = ({ faces }) => {
    this.setState({ isFaceDetected: false });
    console.log("Faces detection error:", faces);
  };

  onTextRecognized = ({ textBlocks }) => {
    console.log(textBlocks.map(b => b.value));
    // this.setState({ detectedTexts: textBlocks.map(b => b.value) })
  };

  render() {
    return (
      <View style={styles.container}>
        {!this.state.image ? (
          <RNCamera
            ref={cam => {
              this.camera = cam;
            }}
            autoFocus
            style={styles.preview}
            key="camera"
            playSoundOnCapture
            notAuthorizedView={null}
            type={this.state.cameraType}
            mirrorImage={this.state.mirrorMode}
            androidCameraPermissionOptions={{
              title: "Permission to use camera",
              message: "We need your permission to use your camera",
              buttonPositive: "Ok",
              buttonNegative: "Cancel"
            }}
            androidRecordAudioPermissionOptions={{
              title: "Permission to use audio recording",
              message: "We need your permission to use your audio",
              buttonPositive: "Ok",
              buttonNegative: "Cancel"
            }}
            faceDetectionMode={RNCamera.Constants.FaceDetection.Mode.accurate}
            onFacesDetected={this.onFacesDetected}
            onFaceDetectionError={this.onFaceDetectionError}
            onTextRecognized={this.onTextRecognized}
          >
            {this.state.isFaceDetected && (
              <Text style={styles.faceDetected}>FACE DETECTED</Text>
            )}
            <TouchableOpacity
              style={styles.capture}
              onPress={this.takePicture.bind(this)}
            >
              <Icon name="photo-camera" size={32} color="#FFF" />
            </TouchableOpacity>
            {/* <Text style={styles.capture} onPress={this.storePicture.bind(this)}>
              [UPLOAD]
            </Text> */}
            <TouchableOpacity
              style={styles.capture}
              onPress={this.changeCameraType.bind(this)}
            >
              <Icon name="camera-front" size={32} color="#FFF" />
            </TouchableOpacity>
          </RNCamera>
        ) : null}

        {this.state.image ? (
          <ImageBackground
            source={{ uri: this.state.image }}
            style={styles.imageBackground}
            key="image"
            resizeMode="cover"
          >
            <TouchableOpacity
              onPress={this.backButton.bind(this)}
              style={styles.backButton}
            >
              <Icon name="arrow-back" size={28} color="#FFF" />
            </TouchableOpacity>
            {/* {this.state.visionResp.map(item => {
              return (
                <TouchableOpacity
                  style={[style.boundingRect, item.position]}
                  key={item.text}
                />
              );
            })} */}
          </ImageBackground>
        ) : null}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  preview: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    height: Dimensions.get("window").height,
    width: Dimensions.get("window").width
  },
  capture: {
    flex: 0,
    // backgroundColor: "#fff",
    // borderRadius: 5,
    // color: "#000",
    padding: 10,
    margin: 30
  },
  imageBackground: {
    position: "absolute",
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    top: 0,
    left: 0
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 20
  },
  faceDetected: {
    color: "#FFF",
    fontWeight: "bold",
    top: 20,
    flex: 0,
    position: "absolute"
  }
});
