import { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FetchData } from './functions';
import Select from 'react-select';
import NavigationBar from './NavigationBar';
import FileDialogue from './FileDialogue';
import { Buffer } from 'buffer';


// import './app.css';
// import data from './Users.json';


export default function ProfileOfUser() {
    const nav = useNavigate()
    const loc = useLocation()

    const STATE = {
        email: '',
        imgUrl: '',
        sex: '',
        phoneNb: '',
        dob: '',
        password: '',
        passConfirm: true,
        usernameConfirm: true,
        passwordConfirm: '',
        sports: '',
        sportsOptions: [{ value: 'bas', label: 'Baskteball' },
        { value: 'voll', label: 'Volley Ball' },
        { value: 'fut', label: 'Futsal' },
        { value: 'foot', label: 'Foot Ball' },],
    }

    const [state, setState] = useState(STATE)
    const FillData = useCallback(async () => {


        let data = await FetchData(`http://localhost:3001/api/users/getUserById`, 'get')

        let finalData = data.data
        if (finalData.success === 1) {
            setState(prv => {
                return {
                    ...prv,
                    email: finalData.data[0].email,
                    imgUrl: finalData.data[0].profile_picture,
                    username: finalData.data[0].username,
                    sex: finalData.data[0].gender,
                    phoneNb: finalData.data[0].phoneNumber,
                    dob: finalData.data[0].dob,
                    address: finalData.data[0].address,
                }
            })
        }
    }, [])
    useEffect(() => {
        if (loc.pathname === '/editProfile') {
            FillData()
        }
    }, [loc])
    const handleChange = useCallback((e) => {
        setState(prv => {
            return {
                ...prv,
                [e.target.name]: e.target.value
            }
        })
    }, [])
    // const submitHandle = () => {
    //     try {

    //         const user = data.map(object => {
    //             return object.username;
    //         })
    //         if (user.indexOf(obj.username) !== -1) {
    //             alert("username already existed !")
    //             return;
    //         }
    //         if (obj.password !== obj.passConfirmation) {
    //             alert("Please make sure that the password match")
    //             return;
    //         }

    //     } catch (error) {
    //         alert(error)
    //     }
    // }
    const handleBack = useCallback(() => {

        nav(-1)
    }, [])
    const getImageBlob = (base64Image) => {
        return fetch(base64Image)
          .then((response) => {
            return response.blob();
          })
          .then((blob) => {
            return blob;
          });
      };
      
    const handleSaveUser = useCallback(async () => {
        // if(!state.usernameConfirm||!state.passwordConfirm){
        //     alert('cannot save user')
        //     return
        // }
  
          let params = {
            username: state.username,
            email: state.email,
            dob: state.dob,
            address: state.address,
            password: state.password,
            gender: state.sex,
            phoneNumber: state.phoneNb,
            profile_picture: state.imgUrl,
        }
        console.log(params)
        const data = await FetchData('http://localhost:3001/api/users/createUser', 'post', params)
        if (data.data.success === 1) {
            console.log('username', state.username);
            debugger
            const data2 = await FetchData('http://localhost:3001/createChatUser', 'post', { username: state.username })

            alert('Sign Up succesful. Please return to the Login Page')

            // nav('/login')
        }

    }, [state])
    const handleUpdate = useCallback(async () => {
        let token = sessionStorage.getItem('auth')

        let params = {
            email: state.email,
            dob: state.dob,
            address: state.address,
            //    password: state.password,
             gender: state.sex,
            phoneNumber: state.phoneNb,
            user_id: token,
            profile_picture: state.imgUrl
        }
        console.log(params)
        const data = await FetchData('http://localhost:3001/api/users/updateUserProfile', 'post', params)
        if (data.data.success === 1) {
            console.log('username', state.username);



            alert('User Updated successfully')

            // nav('/login')
        }
        if (data.success === 0) {

        }
    }, [state])
    const handleBlurPass = useCallback((e) => {
        if (e.target.value !== state.password) {
            setState(prv => {
                return {
                    ...prv,
                    passConfirm: false,
                }
            })
        }
        else {
            setState(prv => {
                return {
                    ...prv,
                    passConfirm: true,
                }
            })
        }
    }, [state.password])
    const handleBlurUsername = useCallback(async (e) => {
        let data = await FetchData(`http://localhost:3001/api/users/getUserByUsername/${e.target.value}`, 'get')
        if (data?.data?.data?.length >0)
            setState(prv => {
                return {
                    ...prv,
                    usernameConfirm: false,
                }
            })
        else
            setState(prv => {
                return {
                    ...prv,
                    usernameConfirm: true,
                }
            })

    }, [state.password])
    const onUpld = useCallback((imageUrl) => setState(prv => { return { ...prv, imgUrl: imageUrl } }), [])
    return (
        <>
         {loc.pathname === '/editProfile' && <NavigationBar />}
            <div className="container rounded bg-white mt-1 mb-1">
                <div className="row">
                    <div className="col-md-3 border-right">
                        <div className="d-flex flex-column align-items-center text-center p-3 py-5">
                            {/* <img className="rounded-circle mt-5" width="150px" src="https://st3.depositphotos.com/15648834/17930/v/600/depositphotos_179308454-stock-illustration-unknown-person-silhouette-glasses-profile.jpg" /> */}
                            <FileDialogue imgUrl={state.imgUrl} onUpload={onUpld} />
                            <span> </span></div>
                    </div>
                    <div className="col-md-5 border-right">
                        <div className="p-3 py-5">
                            <div className="d-flex justify-content-between align-items-center ">
                                {/* <h4 className="text-right">Profile Settings</h4> */}
                            </div>
                            <div className="row mt-2">
                                <div className="col-md-8"><label className="labels">Username</label>
                                    <input type="text" className="form-control" disabled={loc.pathname === '/editProfile'} onBlur={handleBlurUsername} onChange={handleChange} placeholder="username" value={state.username} name='username' /></div>

                            </div>
                            {!state.usernameConfirm && <span className='text-danger'>Username Already exists</span>}
                            <div className="row mt-3">
                                <div className="col-md-12"><label className="labels">Mobile Number</label><input type="number" onChange={handleChange} className="form-control" placeholder="enter phone number" value={state.phoneNb} name='phoneNb' /></div>
                                <div className="col-md-12"><label className="labels">Address </label><input type="text" className="form-control" onChange={handleChange} placeholder="enter address" value={state.address} name="address" /></div>
                                <div className="col-md-12"><label className="labels">Email ID</label><input type="text" className="form-control" onChange={handleChange} placeholder="enter email id" value={state.email} name='email' /></div>
                                {loc.pathname === '/signUp'&&<><div className="col-md-12"><label className="labels">Password</label><input type="password" className="form-control" onChange={handleChange} placeholder="password" value={state.password} name='password' /></div>
                                <div className="col-md-12"><label className="labels">Confirm Password</label><input type="password" className="form-control" onChange={handleChange} onBlur={handleBlurPass} placeholder="Confirm password"
                                    value={state.passwordConfirm} name='passwordConfirm' /></div></> }
                                {!state.passConfirm && <span className='text-danger'>Password does not match</span>}
                            </div>
                            {/* <div className="row mt-3">
                                <div className="col-md-6"><label className="labels">Country</label><input type="text" className="form-control" onChange={handleChange} placeholder="country" value="" /></div>
                                <div className="col-md-6"><label className="labels">State/Region</label><input type="text" className="form-control" value="" onChange={handleChange} placeholder="state" /></div>
                            </div> */}
                            {loc.pathname === '/signUp' && 
                            <div className="mt-5 text-center"><button onClick={handleSaveUser} className="btn btn-outline-primary btn-lg" type="button">Save Profile</button></div>

}
                            {loc.pathname === '/editProfile' &&
                            <div className="mt-5 text-center"><button onClick={handleUpdate} className="btn btn-outline-primary" type="button">Save Profile</button></div>
}
                            </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3 py-5">
                        <div className="col-2 offset-3 ml-4 title text-primary">
                        </div>
                            {/* <div className="d-flex justify-content-between align-items-center experience"><span>Edit Experience</span><span className="border px-3 p-1 add-experience"><i className="fa fa-plus"></i>&nbsp;Experience</span></div><br/> */}
                            <div className="col-md-12"><label className="labels">Date of Birth</label><input type="text" className="form-control" onChange={handleChange} placeholder="--/--/--" value={state.dob} name='dob' /></div> <br />
                            <div className="col-md-12"><label className="labels">Gender</label><input type="text" className="form-control" onChange={handleChange} value={state.sex} name='sex' /></div>
                        </div>
                        {loc.pathname === '/signUp' &&  <button className="btn btn-danger" onClick={handleBack}>Back</button>}

                    </div>
                </div>
            </div>

        </>
    )
}






