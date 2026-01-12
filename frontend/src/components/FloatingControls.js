import { Link } from 'react-router-dom';

function FloatingControls({tableLink, enableCancel, onCancel}) {

    const bottom_margin = '30px';

    return (

        <>
            <div className="floating-button-bar">
                <div className="social-btn"  >   
                    <ul className="text-right" style={{flexDirection: "column"}}>
                        <li className="text-center" style={{marginBottom: bottom_margin}}>
                            <button type="submit" className="google" style={{borderColor:"transparent"}}>
                            <i className="fa fa-floppy-o"></i><i className="fa fa-floppy-o"></i>
                            </button>
                        </li>
                        { (enableCancel) ? 
                            <li className="text-center" style={{marginBottom: bottom_margin}}>
                                <Link to="" onClick={onCancel} className="facebook">
                                <i className="fa fa-ban"></i><i className="fa fa-ban"></i>
                                </Link>
                            </li> : ''
                        }
                        <li className="text-center" style={{marginBottom: bottom_margin}}>
                            <Link to={tableLink} className="facebook">
                            <i className="fa fa-eye"></i><i className="fa fa-eye"></i>
                            </Link>
                        </li>
                        <li className="text-center">
                            <Link  to={'/Home'} className="twitter">
                            <i className="fa fa-home"></i><i className="fa fa-home"></i>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </>
    );
}

export default FloatingControls;