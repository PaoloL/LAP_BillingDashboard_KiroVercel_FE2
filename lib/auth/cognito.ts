import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoUserAttribute,
  type CognitoUserSession,
} from "amazon-cognito-identity-js"
import { config } from "@/lib/config"

const poolData = {
  UserPoolId: config.cognito.userPoolId,
  ClientId: config.cognito.clientId,
}

const userPool = new CognitoUserPool(poolData)

export interface SignUpParams {
  email: string
  password: string
  givenName: string
  familyName: string
}

export interface SignInParams {
  email: string
  password: string
}

export interface User {
  email: string
  emailVerified: boolean
  givenName?: string
  familyName?: string
  sub: string
}

// Sign up a new user
export const signUp = (params: SignUpParams): Promise<CognitoUser> => {
  return new Promise((resolve, reject) => {
    const attributeList = [
      new CognitoUserAttribute({ Name: "email", Value: params.email }),
      new CognitoUserAttribute({ Name: "given_name", Value: params.givenName }),
      new CognitoUserAttribute({ Name: "family_name", Value: params.familyName }),
    ]

    // Generate a unique username (UUID) since user pool uses email alias
    const username = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    userPool.signUp(username, params.password, attributeList, [], (err, result) => {
      if (err) {
        reject(err)
        return
      }
      if (result?.user) {
        resolve(result.user)
      } else {
        reject(new Error("User creation failed"))
      }
    })
  })
}

// Verify email with confirmation code
export const verifyEmail = (email: string, code: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    cognitoUser.confirmRegistration(code, true, (err) => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}

// Sign in user
export const signIn = (params: SignInParams): Promise<CognitoUserSession> => {
  return new Promise((resolve, reject) => {
    const authenticationDetails = new AuthenticationDetails({
      Username: params.email,
      Password: params.password,
    })

    const cognitoUser = new CognitoUser({
      Username: params.email,
      Pool: userPool,
    })

    cognitoUser.authenticateUser(authenticationDetails, {
      onSuccess: (session) => {
        resolve(session)
      },
      onFailure: (err) => {
        reject(err)
      },
      newPasswordRequired: () => {
        reject(new Error("New password required"))
      },
    })
  })
}

// Sign out user
export const signOut = (): Promise<void> => {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser()
    if (cognitoUser) {
      cognitoUser.signOut()
    }
    resolve()
  })
}

// Get current authenticated user
export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser()

    if (!cognitoUser) {
      resolve(null)
      return
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) {
        resolve(null)
        return
      }

      cognitoUser.getUserAttributes((err, attributes) => {
        if (err || !attributes) {
          resolve(null)
          return
        }

        const userAttributes: Record<string, string> = {}
        attributes.forEach((attr) => {
          userAttributes[attr.Name] = attr.Value
        })

        resolve({
          email: userAttributes.email,
          emailVerified: userAttributes.email_verified === "true",
          givenName: userAttributes.given_name,
          familyName: userAttributes.family_name,
          sub: userAttributes.sub,
        })
      })
    })
  })
}

// Get current session
export const getSession = (): Promise<CognitoUserSession | null> => {
  return new Promise((resolve) => {
    const cognitoUser = userPool.getCurrentUser()

    if (!cognitoUser) {
      resolve(null)
      return
    }

    cognitoUser.getSession((err: Error | null, session: CognitoUserSession | null) => {
      if (err || !session?.isValid()) {
        resolve(null)
        return
      }
      resolve(session)
    })
  })
}

// Forgot password - send verification code
export const forgotPassword = (email: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    cognitoUser.forgotPassword({
      onSuccess: () => {
        resolve()
      },
      onFailure: (err) => {
        reject(err)
      },
    })
  })
}

// Confirm new password with verification code
export const confirmPassword = (email: string, code: string, newPassword: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    cognitoUser.confirmPassword(code, newPassword, {
      onSuccess: () => {
        resolve()
      },
      onFailure: (err) => {
        reject(err)
      },
    })
  })
}

// Resend verification code
export const resendVerificationCode = (email: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    })

    cognitoUser.resendConfirmationCode((err) => {
      if (err) {
        reject(err)
        return
      }
      resolve()
    })
  })
}
