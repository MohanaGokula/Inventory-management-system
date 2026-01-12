import HelpIcon from '@mui/icons-material/Help';

function QuestionIcon({onClickHandler}) {

    return(
        <>
            <HelpIcon onClick={onClickHandler}
            sx={{cursor: 'pointer',
                color: 'white',
                fontSize: '24px',
                backgroundColor: 'primary.dark',
                margin: '8px 3px 3px 3px',
                padding: '2px',
                borderRadius: '15px'
            }}
            />
        </>
    );
}

export default QuestionIcon;