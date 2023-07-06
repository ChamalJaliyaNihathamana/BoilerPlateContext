import {
    CognitoUser,
    CognitoUserSession,
    ISignUpResult,
  } from 'amazon-cognito-identity-js'
  import { Amplify, Auth } from 'aws-amplify'
  import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
  } from 'react'
  
  Amplify.configure({
    Auth: {
      region: process.env.NEXT_PUBLIC_AMPLIFY_REGION,
      userPoolId: process.env.NEXT_PUBLIC_AMPLIFY_USER_POOL_ID,
      userPoolWebClientId: process.env.NEXT_PUBLIC_AMPLIFY_CLIENT_ID,
    },
  })
  
  interface AuthContextValues {
    answerCustomChallenge: (answer: string) => Promise<any>
    currentSession: CognitoUserSession | null
    loadingSession: boolean
    logout: () => Promise<any>
    resendEmail: (captchaToken: string) => Promise<any>
    signIn: (email: string, captchaToken?: string) => Promise<any>
    signUp: (email: string) => Promise<ISignUpResult | null>
    user: CognitoUser | null
  }
  
  const AuthContext = createContext<AuthContextValues>({
    answerCustomChallenge: async () => null,
    currentSession: null,
    loadingSession: true,
    logout: async () => null,
    resendEmail: async () => null,
    signIn: async () => null,
    signUp: async () => null,
    user: null,
  })
  
  /**
   *
   * @param bytes
   * @returns
   */
  const getRandomString = (bytes: number) => {
    const randomValues = new Uint8Array(bytes)
  
    window.crypto.getRandomValues(randomValues)
  
    return Array.from(randomValues)
      .map((nr: number) => nr.toString(16).padStart(2, '0'))
      .join('')
  }
  
  /**
   *
   * @param email
   */
  const signUp = async (email: string) => {
    try {
      const result = await Auth.signUp({
        password: getRandomString(30),
        username: email,
      })
  
      return result
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message)
      }
  
      throw new Error('Something went wrong')
    }
  }
  
  interface AuthProviderOptions {
    children?: React.ReactNode
  }
  
  export const AuthProvider = ({ children }: AuthProviderOptions) => {
    const [user, setUser] = useState<CognitoUser | null>(null)
    const [loadingSession, setLoadingSession] = useState(true)
    const [currentSession, setCurrentSession] =
      useState<CognitoUserSession | null>(null)
  
    const checkSession = useCallback(async () => {
      const session = await Auth.currentSession()
      if (session) {
        setCurrentSession(session)
      }
    }, [])
  
    useEffect(() => {
      checkSession()
        .then(() => {
          setLoadingSession(false)
        })
        .catch(err => {
          setLoadingSession(false)
          console.debug(err)
        })
    }, [checkSession])
  
    const logout = () => {
      setCurrentSession(null)
  
      return Auth.signOut()
    }
  
    /**
     *
     * @param email
     * @param captchaToken
     */
    const signIn = async (email: string, captchaToken?: string) => {
      try {
        const cognitoUser: CognitoUser = await Auth.signIn(email)
        setUser(cognitoUser)
  
        cognitoUser.sendCustomChallengeAnswer(captchaToken as string, {
          onSuccess: () => {},
          onFailure: err => console.log(err),
        })
  
        return cognitoUser
      } catch (error) {
        if (error instanceof Error) {
          throw new Error("Something isn't right. No email found.")
        }
      }
    }
  
    const resendEmail = async (captchaToken: string) => {
      if (user) {
        await signIn(user.getUsername(), captchaToken)
      }
    }
  
    const answerCustomChallenge = async (answer: string) => {
      // Send the answer to the User Pool
      // This will throw an error if it’s the 3rd wrong answer
  
      const cognitoUser = await Auth.sendCustomChallengeAnswer(user, answer)
      setUser(cognitoUser)
  
      try {
        // This will throw an error if the user is not yet authenticated:
        const session = await Auth.currentSession()
        setCurrentSession(session)
  
        return session
      } catch (err) {
        if (err === 'No current user') {
          throw new Error('Invalid verification code. Please try again')
        }
        if (err === 'Invalid session for the user.') {
          await user?.refreshSession(
            cognitoUser.getSessionToken(),
            (err, session) => {
              console.debug(`New session: ${session}`)
            },
          )
        } else {
          if (err instanceof Error) {
            throw new Error(err.message)
          }
        }
      }
    }
  
    const value = {
      answerCustomChallenge,
      currentSession,
      loadingSession,
      logout,
      resendEmail,
      signIn,
      signUp,
      user,
    }
  
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  }
  
  export const useAuthProvider = () => {
    return useContext(AuthContext)
  }
  