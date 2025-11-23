import useUser from "../../zustand/user.store"
import FlexContainer from "../common/FlexContainer"

const UserProfile = ()=>{
    const {user} = useUser()
    console.log(user)
    return(
        <FlexContainer>
        <h1>
            {user.username}'s Profile
        </h1>
        </FlexContainer>
    )
}

export default UserProfile