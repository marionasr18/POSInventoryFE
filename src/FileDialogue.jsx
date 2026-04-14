import React, { useEffect, useState } from 'react'

export default function FileDialogue({ imgUrl, onUpload }) {
    const [picture, setPicture] = useState(null);
    const [imgData, setImgData] = useState(imgUrl);

    useEffect(() => {

        setImgData(imgUrl);


    }, [imgUrl])

    const onChangePicture = e => {
        if (e.target.files[0]) {
            console.log("picture: ", e.target.files);
            setPicture(e.target.files[0]);
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                setImgData(reader.result);
                onUpload(reader.result)
            });
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    return (
        <div className="register_wrapper">


            <div className="formInstructionsDiv formElement">

                <div className="register_profile_image">
                    <input id="profilePic" type="file" onChange={onChangePicture} />
                </div>
                <div className="previewProfilePic">
                    <img className="playerProfilePic_home_tile" src={imgData} />
                </div>
            </div>




        </div>
    );
};


