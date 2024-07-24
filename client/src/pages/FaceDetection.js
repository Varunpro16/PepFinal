import React from 'react'

const FaceDetection = ({user}) => {
    const handleDetection = () => {
        console.log(user);
        const url = `http://localhost:5000/${user.domain}/${user.batch}`;
        window.open(url, '_blank', 'noopener,noreferrer');
    }
  return (
    <div>
      <button onClick={handleDetection}>detection</button>
    </div>
  )
}

export default FaceDetection
