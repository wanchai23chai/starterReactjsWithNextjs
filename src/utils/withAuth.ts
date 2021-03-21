import { RebateAppContext, RebateAppPageProps } from '../intefaces'
import { authApi } from '../api/AuthApi'
import { RootState } from '../stores'
import redirect from './redirect'
import userToken from './userToken'


export default async (ctx: RebateAppContext): Promise<RebateAppPageProps> => {

  // Get state from Redux store
  const { auth } = ctx.store.getState() as RootState
  // withAuth should return
  const props: RebateAppPageProps = {
    layout: 'none',
    error: undefined,
    token: undefined,
    userInfo: undefined,
    userMenu: undefined,
    masterData: undefined
  }
  // Get user token from cookie or store
  const token = ctx.isServer ? userToken.getUserToken(ctx.req) : auth.token

  if (!token) {
    /**
     * redirect to `/login` page because
     * user not have permission to access page.
     */
    redirect('/login', ctx)
    throw new Error('Token not found')
  }

  // Verify user token
  const resVerifyToke = await authApi.verifyToken(token)

  if (resVerifyToke.isSuccess) {

    // Set token verify
    props.token = token


  } else {
    /**
     * this case excute when
     * user token expires or incorrect
     */
    userToken.removeUserToken(ctx.res)
    redirect('/login', ctx)
    throw new Error(resVerifyToke.error.message)
  }

  return props
}