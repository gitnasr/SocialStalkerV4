import { FaCogs } from "react-icons/fa";

const Options = () => {
    
	return (
        <div className='bg-gray-950 min-h-screen text-white'>
        <div className='container flex justify-center mx-auto flex-col'>
          <div className=' py-8 mx-auto'>
            <img
              src='https://i.ibb.co/JvTZ4MH/icon128.png'
              alt='SocialStalker Logo'
              className='w-24 h-24'
            />
          </div>
          <div className='mx-auto'>
            <h4 className='text-xl font-bold text-center mb-4'>Your History</h4>
  
            <div className='flex flex-col justify-center bg-white ring-blue-600 ring-1 text-black rounded-xl  w-fit shadow-md border'>
              <div className='flex flex-row'>
                <img
                  src='https://i.vgy.me/lb68R5.jpg'
                  alt='USERNAME PROFILE '
  
                  className='rounded-l-xl pr-2 w-12 h-12'
                />
                <div className='flex flex-row pr-5 m-auto items-center'>
                  <div className="mr-6">
                    <h2 className='text-xl font-bold leading-none'>SERVICE_NAME</h2>
                    <h5 className='text-sm text-gray-500 '>
                      2 days ago
                    </h5>
                  </div>
                  <span className='inline-flex items-center justify-center rounded-full  px-2.5 py-0.5 h-fit bg-amber-700 text-amber-100'>
                  <FaCogs className='-ms-1 me-1.5 h-4 w-4'/>
  
                    <p className='whitespace-nowrap text-sm'>Refunded</p>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
	);
};

export default Options;
