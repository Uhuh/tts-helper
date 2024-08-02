const COMMANDS: &[&str] = &[
    "list_output_devices", "list_monitors", "snapshot_monitor", "set_output_device", "play_audio", "set_playback_state", "set_output_volume", "toggle_pause", "set_audio_state", "list_audio"
];

fn main() {
    tauri_plugin::Builder::new(COMMANDS)
        .build();
}