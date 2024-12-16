import React, { useState, useEffect } from 'react';

function App() {
    const [originalImage, setOriginalImage] = useState(null);
    const [originalSize, setOriginalSize] = useState('');
    const [newWidth, setNewWidth] = useState('');
    const [newHeight, setNewHeight] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [resultImage, setResultImage] = useState(null);
    const [originalWidth, setOriginalWidth] = useState(0);
    const [originalHeight, setOriginalHeight] = useState(0);

    useEffect(() => {
        resetPage();
    }, []);

    const resetPage = () => {
        setOriginalImage(null);
        setOriginalSize('');
        setNewWidth('');
        setNewHeight('');
        setErrorMessage('');
        setLoading(false);
        setResultImage(null);
        setOriginalWidth(0);
        setOriginalHeight(0);
    };

    const showOriginalImage = (event) => {
        resetPage(); // Reset before loading a new image
        const file = event.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setOriginalImage(url);

            const img = new Image();
            img.onload = function() {
                setOriginalWidth(img.width);
                setOriginalHeight(img.height);
                setOriginalSize(`Original Size: ${img.width} x ${img.height} px`);
                setNewWidth(img.width);
                setNewHeight(img.height);
            };
            img.src = url;
        }
    };

    const validateInput = () => {
        if (newWidth > originalWidth || newHeight > originalHeight) {
            setErrorMessage('The new dimensions must be less than or equal to the original dimensions.');
            return false;
        } else {
            setErrorMessage('');
            return true;
        }
    };

    const uploadImage = () => {
        if (!validateInput()) {
            return;
        }

        const file = document.getElementById('imageInput').files[0];
        const n_of_cols_to_reduce = originalWidth - newWidth;
        const n_of_rows_to_reduce = originalHeight - newHeight;
        const formData = new FormData();
        formData.append('image', file);
        formData.append('n_of_cols_to_reduce', n_of_cols_to_reduce);
        formData.append('n_of_rows_to_reduce', n_of_rows_to_reduce);

        setLoading(true);

        fetch('https://scarveserver-production.up.railway.app/seamcarve', {
            method: 'POST',
            body: formData
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok ' + response.statusText);
                }
                return response.blob();
            })
            .then(blob => {
                setLoading(false);
                const url = URL.createObjectURL(blob);
                setResultImage(url);
            })
            .catch(error => {
                setLoading(false);
                console.error('There has been a problem with your fetch operation:', error);
            });
    };

    return (
        <div>
            <input type="file" id="imageInput" onChange={showOriginalImage} />
            <br />
            {originalImage && <img src={originalImage} alt="Original Image" />}
            <br />
            <span>{originalSize}</span>
            <br />
            <label htmlFor="newWidth">New Width:</label>
            <input type="number" id="newWidth" value={newWidth} onChange={(e) => setNewWidth(e.target.value)} />
            <br />
            <label htmlFor="newHeight">New Height:</label>
            <input type="number" id="newHeight" value={newHeight} onChange={(e) => setNewHeight(e.target.value)} />
            <br />
            {errorMessage && <span style={{ color: 'red' }}>{errorMessage}</span>}
            <br />
            <button onClick={uploadImage}>Upload</button>
            <br />
            {loading && <div>Loading...</div>}
            <br />
            {resultImage && <img src={resultImage} alt="Result Image" />}
            <br />
            {resultImage && <a href={resultImage} download="seamcarved_image.png">Download Image</a>}
        </div>
    );
}

export default App;
