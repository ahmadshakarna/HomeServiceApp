import {
  useSSO,
} from "@clerk/expo";

import * as AuthSession
  from "expo-auth-session";

import * as WebBrowser
  from "expo-web-browser";

import {
  router,
} from "expo-router";

import {
  useEffect,
  useState,
} from "react";

import {
  Alert,
  Platform,
} from "react-native";



type SocialStrategy =
  | "oauth_google"
  | "oauth_github"
  | "oauth_apple";


WebBrowser.maybeCompleteAuthSession();


const useSocialAuth = () => {
  const [
    loadingStrategy,
    setLoadingStrategy,
  ] =
    useState<
      SocialStrategy | null
    >(null);


  const {
    startSSOFlow,
  } = useSSO();


  // ========================================
  // WARM UP BROWSER - ANDROID
  // ========================================

    useEffect(() => {
    if (
      Platform.OS !==
      "android"
    ) {
      return;
    }


    void WebBrowser.warmUpAsync();


    return () => {
      void WebBrowser.coolDownAsync();
    };

  }, []);


  // ========================================
  // SOCIAL AUTH
  // ========================================

  const handleSocialAuth =
    async (
      strategy:
        SocialStrategy
    ) => {
      if (
        loadingStrategy
      ) {
        return;
      }


      setLoadingStrategy(
        strategy
      );


      try {
        const redirectUrl =
          AuthSession.makeRedirectUri({
            scheme:
              "homeservice",

            path:
              "/continue",
          });


        console.log(
          "SSO REDIRECT URL:",
          redirectUrl
        );


        const {
          createdSessionId,
          setActive,
          signIn,
          signUp,
        } =
          await startSSOFlow({
            strategy,
            redirectUrl,
          });


        console.log(
          "SSO RESULT:",
          {
            createdSessionId,

            signInStatus:
              signIn?.status,

            signUpStatus:
              signUp?.status,
          }
        );


        // =====================================
        // SUCCESS
        // =====================================

        if (
          createdSessionId &&
          setActive
        ) {
          await setActive({
            session:
              createdSessionId,
          });


          router.replace(
            "/"
          );


          return;
        }


        // =====================================
        // NOT COMPLETE
        // =====================================

        console.log(
          "SSO NOT COMPLETE:",
          {
            signIn:
              signIn?.status,

            signUp:
              signUp?.status,
          }
        );


        Alert.alert(
          "Sign-in incomplete",
          "Sign-in needs another step or the redirect URL is not configured correctly."
        );

      } catch (error) {
        console.error(
          "SOCIAL AUTH ERROR:",
          JSON.stringify(
            error,
            null,
            2
          )
        );


        Alert.alert(
          "Error",
          "Failed to sign in. Please try again."
        );

      } finally {
        setLoadingStrategy(
          null
        );
      }
    };


  return {
    handleSocialAuth,
    loadingStrategy,
  };
};


export default useSocialAuth;