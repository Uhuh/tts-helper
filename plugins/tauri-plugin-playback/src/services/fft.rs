use num_complex::Complex64;

pub fn calculate_mouth(complex: &[Complex64], previous_value: f64) -> (f64, f64) {
    let value_to_display = auto_correlate(&complex, 44100);

    let form = if value_to_display == -1.0 {
        0.5f64
    } else {
        let smoothing_threshold = 99999.0;
        if !note_is_similar_enough(value_to_display, previous_value, smoothing_threshold) {
            return (0f64, 0f64);
        }

        let min_factor = 400.0;
        let max_factor = 10000.0;

        let smoothing_factor = if value_to_display / min_factor > 0.5 {
            value_to_display / max_factor
        } else {
            value_to_display / min_factor
        };

        1.0 - smoothing_factor
    };

    // Return the form and the now "previous" value.
    (form, value_to_display)
}

fn note_is_similar_enough(value: f64, previous_value: f64, threshold: f64) -> bool {
    f64::abs(value - previous_value) < threshold
}

/**
 * @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 * This function is a mess, because it was taken from a mess.
 * I'm not sure exactly what all variables are supposed to do,
 * Poor variable names etc.
 * @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
 */
fn auto_correlate(buffer: &[Complex64], sample_rate: usize) -> f64 {
    let mut sum_of_squares = 0.0f64;
    for sample in buffer {
        sum_of_squares += sample.re.abs() * sample.re.abs() + sample.im.abs() * sample.im.abs();
    }

    let speech_power = sum_of_squares / buffer.len() as f64; // Calculate speech power

    let mut non_speech_start = 0;
    let mut non_speech_end = buffer.len() - 1;
    let threshold = 0.2;
    for i in 0..buffer.len() / 2 {
        if buffer[i].re.abs() < threshold {
            non_speech_start = i;
            break;
        }
    }
    for i in 1..(buffer.len() / 2) {
        let index = buffer.len() - i - 1;
        if buffer[index].re.abs() < threshold {
            non_speech_end = index;
            break;
        }
    }

    let speech_buffer = &buffer[non_speech_start..=non_speech_end];
    let mut autocorrelations = vec![0.0f64; speech_buffer.len()];
    for i in 0..speech_buffer.len() {
        for j in 0..speech_buffer.len() - i {
            let sample1 = speech_buffer[j];
            let sample2 = speech_buffer[j + i];
            autocorrelations[i] +=
                (sample1.re * sample2.re + sample1.im * sample2.im) / speech_power;
            // Normalize by speech power
        }
    }

    let peak_index = autocorrelations
        .iter()
        .enumerate()
        .max_by(|(_, a), (_, b)| a.partial_cmp(b).unwrap())
        .unwrap()
        .0;

    let mut max_value = f64::NEG_INFINITY;
    let mut max_index = 0;
    for i in peak_index + 1..autocorrelations.len() {
        if autocorrelations[i] > max_value {
            max_value = autocorrelations[i];
            max_index = i;
        }
    }

    let speech_power = if max_index > 0 {
        autocorrelations[max_index - 1]
    } else {
        autocorrelations[max_index]
    };
    let max_speech_power = autocorrelations[max_index];
    let next_speech_power = if max_index + 1 < autocorrelations.len() {
        autocorrelations[max_index + 1]
    } else {
        max_speech_power
    };

    let averaged_speech_power = (speech_power + next_speech_power - 2.0 * max_speech_power) / 2.0;
    let difference_speech_power = (next_speech_power - speech_power) / 2.0;

    let mut new_peak_index = max_index as f64;
    if averaged_speech_power.abs() > 0.001 {
        new_peak_index -= difference_speech_power / (2.0 * averaged_speech_power);
    }

    if new_peak_index < 1.0 {
        new_peak_index = 1.0;
    }

    (sample_rate as f64) / new_peak_index
}

pub fn max_min_mouth(samples: &[f32]) -> (f64, f64) {
    let mut max = 0f64;
    let mut min = 0f64;

    for sample in samples {
        max = max.max(*sample as f64);
        min = min.min(*sample as f64);
    }

    (max, min)
}
