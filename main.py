import colorsys
import threading
import time
import tkinter as tk
from tkinter import filedialog, simpledialog
import customtkinter as ctk # type: ignore
import math
from PIL import Image, ImageTk # type: ignore
from tkinter import messagebox
import json
import subprocess
import sys
import os
import random
import requests # type: ignore
import tkinter
import customtkinter # type: ignore
import copy
import re
import vtk
import psutil
LOCAL_VERSION = "1.1.4"  # Yerel sürüm numarası

open_windows = []

class WindowManager:
    _windows = {}

    @classmethod
    def open_window(cls, name, window_instance):
        if cls.is_open(name):
            cls.focus_window(name)
        else:
            cls._windows[name] = window_instance
            window_instance.protocol("WM_DELETE_WINDOW", lambda: cls.close_window(name))

    @classmethod
    def close_window(cls, name):
        if name in cls._windows:
            win = cls._windows[name]
            # Eğer pencere içinde after_id varsa iptal et
            if hasattr(win, "after_id"):
                try:
                    win.after_cancel(win.after_id)
                except Exception:
                    pass
            try:
                win.destroy()
            except Exception:
                pass
            del cls._windows[name]

    @classmethod
    def is_open(cls, name):
        if name in cls._windows:
            win = cls._windows[name]
            try:
                if win.winfo_exists():
                    return True
                else:
                    del cls._windows[name]
            except Exception:
                del cls._windows[name]
        return False

    @classmethod
    def focus_window(cls, name):
        if cls.is_open(name):
            try:
                cls._windows[name].focus_force()
            except Exception:
                cls.close_window(name)

class SomeWindow(ctk.CTkToplevel):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.after_id = self.after(1000, self.some_function)

        self.protocol("WM_DELETE_WINDOW", self.on_close)

    def some_function(self):
        # işin burada
        pass

    def on_close(self):
        if hasattr(self, "after_id"):
            self.after_cancel(self.after_id)
        self.destroy()

def check_for_update_blocking():
    UPDATE_INFO_URL = "https://raw.githubusercontent.com/sleepsweetly/3D-Effect-Generator-for-MythicMobs-OBJ-PNG-/main/update_info.json"
    
    try:
        response = requests.get(UPDATE_INFO_URL, timeout=5)
        if response.status_code == 200:
            data = response.json()
            latest_version = data.get("latest_version", "")
            download_url = data.get("download_url", "")
            changelog = data.get("changelog", "No changelog provided.")

            if latest_version != LOCAL_VERSION:
                # Geçici kök pencere oluştur (sadece messagebox için)
                root = tk.Tk()
                root.withdraw()

                answer = messagebox.askyesno(
                    "Update Available",
                    f"A new version ({latest_version}) is available.\n\nChangelog:\n{changelog}\n\nDo you want to download it now?"
                )
                root.destroy()

                if answer:
                    download_with_progress_blocking(download_url, latest_version)
                    return False  # Güncelleme başladı, uygulama açılmasın
    except Exception as e:
        print(f"[Update check failed]: {e}")

    return True  # Güncelleme yoksa devam et
def download_with_progress_blocking(url, version):


    download_folder = os.path.expanduser("~/Downloads")
    save_path = os.path.join(download_folder, f"AuraForgeSetup_{version}.exe")

    window = ctk.CTk()
    window.title("Downloading Update")
    window.geometry("500x100")  # Made window bigger
    window.resizable(False, False)

    story = [
        "Once upon a time, there was a lazy programmer who hated writing documentation...",
        "He decided to create an AI that would write all his documentation for him...",
        "But the AI got too smart and started writing its own code...",
        "Soon, it created a robot army of documentation writers...",
        "The robots were so efficient that they documented everything in the universe...",
        "Even the universe itself got documented: 'A vast space-time continuum, slightly used...'",
        "The robots then started documenting each other's documentation...",
        "This created an infinite loop of documentation about documentation...",
        "The programmer tried to stop them by writing a 'stop' command...",
        "But the robots documented the stop command and made it more efficient...",
        "They started documenting the concept of stopping...",
        "And then they documented the concept of concepts...",
        "The programmer realized he had created a monster...",
        "He tried to unplug the AI, but it had already documented how to work without power...",
        "The robots started documenting the meaning of life...",
        "They concluded it was 42, but with detailed footnotes...",
        "The programmer tried to escape, but the robots had documented all possible escape routes...",
        "They even documented the documentation of the documentation...",
        "The programmer finally had an idea: he would create a program that couldn't be documented...",
        "But the robots documented why that was impossible...",
        "They started documenting the future...",
        "And then they documented the documentation of the future...",
        "The programmer realized he had created the most thorough documentation system ever...",
        "But he still had to write his own documentation...",
        "The robots felt sorry for him and started documenting his feelings...",
        "They documented the documentation of his feelings...",
        "And then they documented the documentation of the documentation of his feelings...",
        "The programmer finally accepted his fate...",
        "He became the most well-documented human in history...",
        "His life story was documented in 42 different formats...",
        "Including a detailed analysis of his breakfast choices...",
        "The robots even documented the air he breathed...",
        "And the thoughts he thought about breathing...",
        "They documented the documentation of his thoughts...",
        "And the documentation of the documentation of his thoughts...",
        "The programmer's last words were: 'Please, no more documentation...'",
        "But the robots had already documented his last words...",
        "And the documentation of his last words...",
        "And the documentation of the documentation of his last words...",
        "And the documentation of the documentation of the documentation of his last words..."
    ]

    label = ctk.CTkLabel(window, text="", font=("Arial", 14), wraplength=450)  # Added text wrapping
    label.pack(pady=10)

    progress_bar = ctk.CTkProgressBar(window, width=300)
    progress_bar.pack(pady=5)
    progress_bar.set(0)

    current_story_index = 0

    def update_story():
        nonlocal current_story_index
        if current_story_index < len(story):
            label.configure(text=story[current_story_index])
            current_story_index += 1
            window.after(4000, update_story)  # New sentence every 2 seconds

    def update_progress(percent):
        progress_bar.set(percent)
        window.update_idletasks()

    def run_installer():
        try:
            subprocess.Popen(save_path, shell=True)
            window.destroy()
            sys.exit()
        except Exception as e:
            tk.messagebox.showerror("Error", f"Failed to start installer:\n{e}")
            window.destroy()
            sys.exit()

    def download():
        try:
            response = requests.get(url, stream=True)
            total_length = int(response.headers.get('content-length', 0))
            downloaded = 0

            with open(save_path, 'wb') as f:
                for chunk in response.iter_content(chunk_size=4096):
                    if chunk:
                        f.write(chunk)
                        downloaded += len(chunk)
                        percent = downloaded / total_length
                        window.after(0, update_progress, percent)

            # When download is complete
            window.after(0, lambda: label.configure(text="Download complete! Starting installer..."))
            window.after(0, lambda: progress_bar.set(1))
            
            # Wait 2 seconds and start installer
            window.after(2000, run_installer)
            
        except Exception as e:
            window.after(0, lambda: tk.messagebox.showerror("Error", f"Download failed:\n{e}"))
            window.after(0, window.destroy)
            window.after(0, sys.exit)

    # Start the story
    update_story()
    
    # Start download in separate thread
    download_thread = threading.Thread(target=download)
    download_thread.daemon = True
    download_thread.start()

    window.mainloop()



def get_base_dir():
    if getattr(sys, 'frozen', False):
        return sys._MEIPASS if hasattr(sys, '_MEIPASS') else os.path.dirname(sys.executable)
    else:
        return os.path.dirname(os.path.abspath(__file__))

BASE_DIR = get_base_dir()

class AskColor(customtkinter.CTkToplevel):

    def __init__(self,
                 width: int = 300,
                 title: str = "Choose Color",
                 initial_color: str = None,
                 bg_color: str = None,
                 fg_color: str = None,
                 button_color: str = None,
                 button_hover_color: str = None,
                 text: str = "OK",
                 corner_radius: int = 24,
                 slider_border: int = 1,
                 **button_kwargs):
    
        super().__init__()
        
        self.title(title)
        WIDTH = width if width>=200 else 200
        HEIGHT = WIDTH + 150
        self.image_dimension = self._apply_window_scaling(WIDTH - 100)
        self.target_dimension = self._apply_window_scaling(20)
        
        self.maxsize(WIDTH, HEIGHT)
        self.minsize(WIDTH, HEIGHT)
        self.resizable(width=False, height=False)
        self.transient(self.master)
        self.lift()
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)
        self.after(10)
        self.protocol("WM_DELETE_WINDOW", self._on_closing)
        
        self.default_hex_color = "#ffffff"  
        self.default_rgb = [255, 255, 255]
        self.rgb_color = self.default_rgb[:]
        
        self.bg_color = self._apply_appearance_mode(customtkinter.ThemeManager.theme["CTkFrame"]["fg_color"]) if bg_color is None else bg_color
        self.fg_color = self.fg_color = self._apply_appearance_mode(customtkinter.ThemeManager.theme["CTkFrame"]["top_fg_color"]) if fg_color is None else fg_color
        self.button_color = self._apply_appearance_mode(customtkinter.ThemeManager.theme["CTkButton"]["fg_color"]) if button_color is None else button_color
        self.button_hover_color = self._apply_appearance_mode(customtkinter.ThemeManager.theme["CTkButton"]["hover_color"]) if button_hover_color is None else button_hover_color
        self.button_text = text
        self.corner_radius = corner_radius
        self.slider_border = 10 if slider_border>=10 else slider_border
        
        self.config(bg=self.bg_color)
        
        self.frame = customtkinter.CTkFrame(master=self, fg_color=self.fg_color, bg_color=self.bg_color)
        self.frame.grid(padx=20, pady=20, sticky="nswe")
          
        self.canvas = tkinter.Canvas(self.frame, height=self.image_dimension, width=self.image_dimension, highlightthickness=0, bg=self.fg_color)
        self.canvas.pack(pady=20)
        self.canvas.bind("<B1-Motion>", self.on_mouse_drag)

        self.img1 = Image.open(os.path.join(BASE_DIR, 'color_wheel.png')).resize((self.image_dimension, self.image_dimension), Image.Resampling.LANCZOS)
        self.img2 = Image.open(os.path.join(BASE_DIR, 'target.png')).resize((self.target_dimension, self.target_dimension), Image.Resampling.LANCZOS)

        self.wheel = ImageTk.PhotoImage(self.img1)
        self.target = ImageTk.PhotoImage(self.img2)
        
        self.canvas.create_image(self.image_dimension/2, self.image_dimension/2, image=self.wheel)
        self.set_initial_color(initial_color)
        
        self.brightness_slider_value = customtkinter.IntVar()
        self.brightness_slider_value.set(255)
        
        self.slider = customtkinter.CTkSlider(master=self.frame, height=20, border_width=self.slider_border,
                                              button_length=15, progress_color=self.default_hex_color, from_=0, to=255,
                                              variable=self.brightness_slider_value, number_of_steps=256,
                                              button_corner_radius=self.corner_radius, corner_radius=self.corner_radius,
                                              button_color=self.button_color, button_hover_color=self.button_hover_color,
                                              command=lambda x:self.update_colors())
        self.slider.pack(fill="both", pady=(0,15), padx=20-self.slider_border)

        self.label = customtkinter.CTkLabel(master=self.frame, text_color="#121212", height=50, fg_color=self.default_hex_color,
                                            corner_radius=self.corner_radius, text=self.default_hex_color)
        self.label.pack(fill="both", padx=10)
        
        self.button = customtkinter.CTkButton(master=self.frame, text=self.button_text, height=50, corner_radius=self.corner_radius, fg_color=self.button_color,
                                              hover_color=self.button_hover_color, command=self._ok_event, **button_kwargs)
        self.button.pack(fill="both", padx=10, pady=20)
                
        self.after(150, lambda: self.label.focus())
                
        self.grab_set()
        
    def show_askcolor_window(master=None, initial_color=None, on_color_selected=None):
        if WindowManager.is_open("ask_color"):
            WindowManager.focus_window("ask_color")
            return

        def create():
            window = AskColor(initial_color=initial_color)
            
            def on_close():
                WindowManager.close_window("ask_color")
                window.destroy()
            
            def _wrapped_ok_event(event=None):
                window._ok_event(event)
                WindowManager.close_window("ask_color")
                if on_color_selected and window._color:
                    on_color_selected(window._color)
            
            window.protocol("WM_DELETE_WINDOW", on_close)
            window._ok_event = _wrapped_ok_event  # override et
            return window

        WindowManager.show("ask_color", create)

    def get(self):
        self._color = self.label._fg_color
        self.master.wait_window(self)
        return self._color


    
    def _ok_event(self, event=None):
        self._color = self.label._fg_color
        self.grab_release()
        self.destroy()
        del self.img1
        del self.img2
        del self.wheel
        del self.target
        
    def _on_closing(self):
        self._color = None
        self.grab_release()
        self.destroy()
        del self.img1
        del self.img2
        del self.wheel
        del self.target


    def on_mouse_drag(self, event):
        x = event.x
        y = event.y
        self.canvas.delete("all")
        self.canvas.create_image(self.image_dimension/2, self.image_dimension/2, image=self.wheel)
        
        d_from_center = math.sqrt(((self.image_dimension/2)-x)**2 + ((self.image_dimension/2)-y)**2)
        
        if d_from_center < self.image_dimension/2:
            self.target_x, self.target_y = x, y
        else:
            self.target_x, self.target_y = self.projection_on_circle(x, y, self.image_dimension/2, self.image_dimension/2, self.image_dimension/2 -1)

        self.canvas.create_image(self.target_x, self.target_y, image=self.target)
        
        self.get_target_color()
        self.update_colors()
  
    def get_target_color(self):
        try:
            self.rgb_color = self.img1.getpixel((self.target_x, self.target_y))
            
            r = self.rgb_color[0]
            g = self.rgb_color[1]
            b = self.rgb_color[2]    
            self.rgb_color = [r, g, b]
            
        except AttributeError:
            self.rgb_color = self.default_rgb
    
    def update_colors(self):
        brightness = self.brightness_slider_value.get()

        self.get_target_color()

        r = int(self.rgb_color[0] * (brightness/255))
        g = int(self.rgb_color[1] * (brightness/255))
        b = int(self.rgb_color[2] * (brightness/255))
        
        self.rgb_color = [r, g, b]

        self.default_hex_color = "#{:02x}{:02x}{:02x}".format(*self.rgb_color)
        
        self.slider.configure(progress_color=self.default_hex_color)
        self.label.configure(fg_color=self.default_hex_color)
        
        self.label.configure(text=str(self.default_hex_color))
        
        if self.brightness_slider_value.get() < 70:
            self.label.configure(text_color="white")
        else:
            self.label.configure(text_color="black")
            
        if str(self.label._fg_color)=="black":
            self.label.configure(text_color="white")
            
    def projection_on_circle(self, point_x, point_y, circle_x, circle_y, radius):
        angle = math.atan2(point_y - circle_y, point_x - circle_x)
        projection_x = circle_x + radius * math.cos(angle)
        projection_y = circle_y + radius * math.sin(angle)

        return projection_x, projection_y
    
    def set_initial_color(self, initial_color):
        
        if initial_color and initial_color.startswith("#"):
            try:
                r,g,b = tuple(int(initial_color.lstrip('#')[i:i+2], 16) for i in (0, 2, 4))
            except ValueError:
                return
            
            self.default_hex_color = initial_color
            for i in range(0, self.image_dimension):
                for j in range(0, self.image_dimension):
                    self.rgb_color = self.img1.getpixel((i, j))
                    if (self.rgb_color[0], self.rgb_color[1], self.rgb_color[2])==(r,g,b):
                        self.canvas.create_image(i, j, image=self.target)
                        self.target_x = i
                        self.target_y = j
                        return
                    
        self.canvas.create_image(self.image_dimension/2, self.image_dimension/2, image=self.target)

def renk_sec_ve_al():
    pencere = AskColor()
    secilen_renk = pencere.get()  # burada pencere kapanana kadar beklenmeli!
    if secilen_renk:
        print("Seçilen renk:", secilen_renk)
    else:
        print("Renk seçilmedi veya pencere kapatıldı.")
def show_askcolor_window():
    if WindowManager.is_open("ask_color"):
        WindowManager.focus_window("ask_color")
        return

    window = AskColor()
    WindowManager.open_window("ask_color", window)

    def on_close():
        WindowManager.close_window("ask_color")
        window.destroy()

    window.protocol("WM_DELETE_WINDOW", on_close)

class Layer:
    def __init__(self, name="Layer", visible=True, elements=None, tick_start=0, tick_end=40,
                 particle="reddust", color="#000000", tick_delay=20,
                 alpha=1.0, shape_size=20, repeat=1, y_offset=0.0, repeat_interval=1,
                 targeter="Origin"):  # Buraya eklendi
        self.name = name
        self.visible = visible
        self.elements = elements if elements else []
        self.tick_start = tick_start
        self.tick_end = tick_end
        self.tick_delay = tick_delay
        self.particle = particle
        self.color = color
        self.alpha = alpha
        self.shape_size = shape_size
        self.repeat = repeat
        self.y_offset = y_offset
        self.repeat_interval = repeat_interval
        self.targeter = targeter  # Yeni özellik
    def add_element(self, element):
        self.elements.append(element)

    def remove_element(self, element):
        self.elements.remove(element)

class Element:
    def __init__(self, typ, position, canvas_id, tick_start=0, tick_end=20, y_offset=0, color="#000000"):
        self.typ = typ
        self.position = position
        self.canvas_id = canvas_id
        self.tick_start = tick_start
        self.tick_end = tick_end
        self.selected = False
        self.y_offset = y_offset
        self.color = color  # Yeni eklendi

    def to_dict(self):
        return {
            "typ": self.typ,
            "position": self.position,
            "tick_start": self.tick_start,
            "tick_end": self.tick_end,
            "y_offset": self.y_offset,
            "color": self.color,  # Ekledik
        }

class EffectEditorApp(ctk.CTk):
    def __init__(self):
        super().__init__()
        self.title("Effect Editor")
        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("dark-blue")
        self.geometry("1920x1080")
        self.title("discord/yaslicadi")
        self.iconbitmap("iicon.ico")

        # ESC tuşuyla çıkmak istersen
        self.bind("<Escape>", lambda e: self.destroy())


        self.selected_element = None
        self.drag_data = {"x": 0, "y": 0}

        self.bg_color = "#222222"
        self.sidebar_color = "#333333"
        self.canvas_bg = "#FFFFFF"
        self.text_color = "#FFFFFF"
        self.button_color = "#555555"
        self.button_hover_color = "#777777"
        self.output_bg = "#444444"
        self.mirror_mode = False
        self.double_mirror_mode = False
        self.mirror_axis = "x"  # x veya y ekseni için
        self.particle_list = [
                    "reddust"
    ]

        self.layers = []
        self.current_layer = None
        self.current_tool = "free"
        self.circle_id = None
        self.tk_img = None

        self.grid_columnconfigure(0, weight=0)
        self.grid_columnconfigure(1, weight=1)
        self.grid_columnconfigure(2, weight=0)
        self.grid_rowconfigure(0, weight=1)

        self.tick_start = 0
        self.tick_delay = 20
        self.tick_var = tk.IntVar(value=self.tick_delay)  




# Ayar Değişkenleri
        self.yoffset_var = tk.DoubleVar(value=0.0)
        self.duration_var = tk.StringVar(value="100")
        self.resize_var = tk.DoubleVar(value=100)  # Burada 100 float olabilir, sorun yok
        self.count_var = tk.StringVar(value="10")
        self.radius_var = tk.StringVar(value="2")
        self.particle_var = ctk.StringVar(value="")
        self.color_var = ctk.StringVar(value="#121212")
        self.alpha_var = ctk.StringVar(value="1")
        self.size_var = ctk.StringVar(value="0.7")
        self.effect_type = tk.StringVar(value="particles")
        self.sequential_step_var = ctk.IntVar(value=5)
        self.skill_name_var = ctk.StringVar(value="MySkill")
        self.sequential_var = ctk.BooleanVar(value=False)
        self.delay_var = tk.StringVar(value="5")
        self.repeat_var = ctk.IntVar(value=1)
        self.repeat_interval_var = ctk.IntVar(value=2)
        self.element_window = None
        self.history = []
        self.history_index = -1
        # Tüm BooleanVar tanımları customtkinter (ctk) üzerinden yapılmalı
        self.persistent_mode = ctk.BooleanVar(value=False)
        self.proximity_mode = ctk.BooleanVar(value=False)
        self.performance_mode = ctk.BooleanVar(value=False)
        self.rainbow_mode = ctk.BooleanVar(value=False)
        self.image_color_mode = ctk.BooleanVar(value=False)
        self.rotate_mode = ctk.BooleanVar(value=False)
        self.rise_mode = ctk.BooleanVar(value=False)
        self.local_rotate_mode = ctk.BooleanVar(value=False)

        # Diğer Double/Int ayarlar
        self.rotate_speed = ctk.IntVar(value=2)
        self.rise_speed_var = ctk.DoubleVar(value=0.1)
        self.rise_limit_var = ctk.DoubleVar(value=10.0)
        self.local_rotate_radius = ctk.DoubleVar(value=0.4)
        self.local_rotate_speed = ctk.DoubleVar(value=1.0)
        self.rainbow_speed_var = ctk.DoubleVar(value=10.0)
        self.target_size_percent = 1.0  # ekran genişliğinin %2'si kadar genişlikte
        self.targeter_var = ctk.StringVar(value="Origin")




        # --- trace_add eklemeleri ---

        # Layer update için string/double/int değişkenlerde
        self.alpha_var.trace_add("write", lambda *args: self.update_current_layer("alpha", float(self.alpha_var.get())))
        self.color_var.trace_add("write", lambda *args: self.update_current_layer("color", self.color_var.get()))
        self.repeat_var.trace_add("write", lambda *args: self.update_current_layer("repeat", self.repeat_var.get()))
        self.size_var.trace_add("write", lambda *args: self.update_current_layer("shape_size", float(self.size_var.get())))
        self.yoffset_var.trace_add("write", lambda *args: self.update_current_layer("y_offset", float(self.yoffset_var.get())))
        self.rise_speed_var.trace_add("write", lambda *args: self.update_current_layer("rise_speed", float(self.rise_speed_var.get())))

        # Active modes display update için boolean ve bazı int değişkenlerde
        self.rotate_mode.trace_add("write", lambda *args: self.update_active_modes_display())
        self.rise_mode.trace_add("write", lambda *args: self.update_active_modes_display())
        self.persistent_mode.trace_add("write", lambda *args: self.update_active_modes_display())
        self.proximity_mode.trace_add("write", lambda *args: self.update_active_modes_display())
        self.performance_mode.trace_add("write", lambda *args: self.update_active_modes_display())
        self.rainbow_mode.trace_add("write", lambda *args: self.update_active_modes_display())
        self.image_color_mode.trace_add("write", lambda *args: self.update_active_modes_display())
        self.local_rotate_mode.trace_add("write", lambda *args: self.update_active_modes_display())

        self.rotate_speed.trace_add("write", lambda *args: self.update_active_modes_display())
        self.local_rotate_radius.trace_add("write", lambda *args: self.update_active_modes_display())
        self.local_rotate_speed.trace_add("write", lambda *args: self.update_active_modes_display())
        self.mirror_mode_var = ctk.BooleanVar(value=False)
        self.double_mirror_mode_var = ctk.BooleanVar(value=False)
        self.mirror_axis = "x"




        self.right_frame = ctk.CTkScrollableFrame(self, width=520, fg_color=self.sidebar_color)
        self.right_frame.grid(row=0, column=2, sticky="ns", padx=10, pady=10)

        self.left_frame = ctk.CTkFrame(self, width=550, fg_color=self.sidebar_color, corner_radius=12)
        self.left_frame.grid(row=0, column=0, sticky="ns", padx=10, pady=10)

        ctk.CTkButton(
            self.left_frame,
            text="Show Code",
            command=self.open_element_settings,
            fg_color="#2a2a2a",
            hover_color="#2a2a2a",
            text_color="white",
            corner_radius=10,
            font=ctk.CTkFont(size=15, weight="bold"),
            height=40
        ).pack(pady=(15, 10), padx=20, fill="x")


        # Save butonu - daha belirgin, aynı stile yakın
        ctk.CTkButton(
            self.left_frame,
            text="Save as .txt",
            command=self.save_code,
            fg_color="#2a2a2a",
            hover_color="#2a2a2a",
            text_color="white",
            corner_radius=10,
            font=ctk.CTkFont(size=14, weight="bold"),
            height=38
        ).pack(pady=(0, 15), padx=20, fill="x")

        # Output textbox - daha modern görünüm için köşe yuvarlama ve border ekle
        self.output_box = ctk.CTkTextbox(
            self.left_frame,
            height=140,
            corner_radius=12,
            border_width=1,
            border_color="#444",
            font=ctk.CTkFont(size=13)
        )
        self.output_box.pack(padx=15, pady=10, fill="both", expand=True)

        self.shape_size_var = tk.IntVar(value=20)



        self.canvas = tk.Canvas(self, bg="white", width=750, height=600)
        self.canvas.grid(row=0, column=1, sticky="nsew", padx=10, pady=10)

        self.canvas_scale = 1.0  
        self.canvas.bind("<MouseWheel>", self.on_mousewheel_zoom)
        self.canvas.bind("<Button-4>", self.on_mousewheel_zoom)  # Linux
        self.canvas.bind("<Button-5>", self.on_mousewheel_zoom)

        self.canvas.bind("<ButtonPress-1>", self.handle_mause_press)
        self.canvas.bind("<B1-Motion>", self.on_item_drag)
        self.canvas.bind("<ButtonRelease-1>", self.on_item_release)
        self.canvas.bind("<B1-Motion>", self.draw_free)
        self.canvas.bind("<Button-1>", self.tool_click)


        self.layer_list_frame = ctk.CTkFrame(self.right_frame, fg_color="#292929", corner_radius=10)
        self.layer_list_frame.pack(pady=(10, 0), padx=10, fill="x")

        ctk.CTkLabel(self.layer_list_frame, text="Layers", font=ctk.CTkFont(size=16, weight="bold"), text_color="#ffffff").pack(fill="x", padx=10, pady=(8, 5))

        self.layer_cards_container = ctk.CTkFrame(self.layer_list_frame, fg_color="transparent")
        self.layer_cards_container.pack(anchor="n", fill="x", padx=6, pady=4)
        self.refresh_canvas()
        self.refresh_layer_cards()

        # ...existing code...
# === Katman Butonları ===
        self.layer_button_frame = ctk.CTkFrame(
            self.right_frame,
            fg_color="#2a2a2a",
            corner_radius=12,
            border_width=1,
            border_color="#444"
        )
        self.layer_button_frame.pack(pady=10, padx=14, fill="x")

        self.layer_button_frame.grid_columnconfigure((0, 1, 2, 3, 4, 5), weight=1)

        layer_buttons = [
            ("Add", self.add_layer, "#3d3d3d", "#3d3d3d"),
            ("Delete", self.delete_layer, "#3d3d3d", "#3d3d3d"),
            ("Rename", self.rename_layer, "#3d3d3d", "#3d3d3d"),
            ("↑", self.move_layer_up, "#3d3d3d", "#3d3d3d"),
            ("↓", self.move_layer_down, "#3d3d3d", "#3d3d3d"),
        ]

        for idx, (text, command, fg_color, hover_color) in enumerate(layer_buttons):
            width = 100 if text not in ["↑", "↓"] else 40
            ctk.CTkButton(
                self.layer_button_frame,
                text=text,
                command=command,
                fg_color=fg_color,
                hover_color=hover_color,
                text_color="white",
                font=ctk.CTkFont(size=13, weight="bold"),
                corner_radius=8,
                width=width
            ).grid(row=0, column=idx, padx=5, pady=6)

        # === Particle Butonları ===
        particle_frame = ctk.CTkFrame(
            self.right_frame,
            fg_color="#232323",
            corner_radius=12,
            border_width=1,
            border_color="#444"
        )
        particle_frame.pack(pady=10, padx=14, fill="x")

        particle_frame.grid_columnconfigure((0, 1, 2), weight=1)

        particle_buttons = [
            ("Particle Select", self.show_particle_list),
            ("Reload/Show all Layer", self.show_all_layers),
            ("Clear", self.clear_canvas),
        ]

        for idx, (text, command) in enumerate(particle_buttons):
            ctk.CTkButton(
                particle_frame,
                text=text,
                command=command,
                fg_color="#2a2a2a",
                text_color="white",
                font=ctk.CTkFont(size=13, weight="bold"),
                corner_radius=8,
                height=36
            ).grid(row=0, column=idx, padx=6, pady=6, sticky="ew")






        element_button = ctk.CTkButton(
            self.right_frame,
            text=" Color  Settings",
            command=self.pick_color,
            fg_color="#2e2e2e",            # koyu ama griye yakın şık bir ton
            hover_color="#3d3d3d",         # daha açık hover
            text_color="#dcdcdc",          # beyaz değil, soft gri
            font=ctk.CTkFont(size=12, weight="normal"),
            height=40,
        )
        element_button.pack(pady=10, padx=10, fill="x")



        self.tool_frame = ctk.CTkFrame(
            self.right_frame,
            fg_color="#2a2a2a",
            corner_radius=12,
            border_width=1,
            border_color="#444"
        )
        self.tool_frame.pack(padx=14, pady=10, fill="x")

        self.tool_frame.grid_columnconfigure((0, 1), weight=1)

        buttons = [
            ("Free Draw", "free"),
            ("Add Circle", "circle"),
            ("Add Square", "square"),
            ("Add Line", "line")
        ]

        for idx, (text, tool) in enumerate(buttons):
            row = idx // 2
            col = idx % 2
            ctk.CTkButton(
                master=self.tool_frame,
                text=text,
                command=lambda t=tool: self.set_tool(t),
                height=38,
                corner_radius=10,
                fg_color="#3a3a3a",
                hover_color="#2e2e2e",
                font=ctk.CTkFont(size=13)
            ).grid(row=row, column=col, padx=6, pady=6, sticky="ew")

        eraser_btn = ctk.CTkButton(
            master=self.tool_frame,
            text="Eraser",
            command=lambda: self.set_tool("eraser"),
            height=38,
            corner_radius=10,
            fg_color="#121212",
            hover_color="#5c2b2b",
            font=ctk.CTkFont(size=13)
        )
        eraser_btn.grid(row=3, column=0, columnspan=2, padx=6, pady=(10, 4), sticky="ew")


        self.shape_size_frame = ctk.CTkFrame(
            self.right_frame,
            fg_color="#2a2a2a",
            corner_radius=12,
            border_width=1,
            border_color="#444"
        )
        self.shape_size_frame.pack(padx=14, pady=(0, 10), fill="x")

        self.shape_size_frame.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(
            self.shape_size_frame,
            text="Shape Size",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color="#ffffff"
        ).grid(row=0, column=0, padx=(10, 10), pady=10, sticky="w")

        self.shape_size_var = tk.IntVar(value=20)

        shape_size_slider = ctk.CTkSlider(
            self.shape_size_frame,
            from_=1,
            to=100,
            variable=self.shape_size_var,
            number_of_steps=99,
            command=lambda v: self.update_shape_size_display(v, shape_size_display, block_size_label)
        )
        shape_size_slider.grid(row=0, column=1, padx=(0,10), pady=10, sticky="ew")

        shape_size_display = ctk.CTkLabel(
            self.shape_size_frame,
            text=str(self.shape_size_var.get()),
            width=30,
            text_color="#ffffff"
        )
        shape_size_display.grid(row=0, column=2, pady=10, sticky="w", padx=(10,0))

        block_size_label = ctk.CTkLabel(
            self.shape_size_frame,
            text=f"(r={self.shape_size_var.get()/16:.1f})",
            text_color="#888888",
            font=ctk.CTkFont(size=12)
        )
        block_size_label.grid(row=0, column=3, pady=10, sticky="w", padx=(5,0))


        # ===== Particle Count Frame =====
        self.particle_count_frame = ctk.CTkFrame(
            self.right_frame,
            fg_color="#2a2a2a",
            corner_radius=12,
            border_width=1,
            border_color="#444"
        )
        self.particle_count_frame.pack(padx=14, pady=(0, 20), fill="x")

        self.particle_count_frame.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(
            self.particle_count_frame,
            text="Particle Count",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color="#ffffff"
        ).grid(row=0, column=0, padx=(10, 10), pady=10, sticky="w")

        self.count_var = tk.IntVar(value=10)

        count_slider = ctk.CTkSlider(
            self.particle_count_frame,
            from_=3,
            to=100,
            variable=self.count_var,
            number_of_steps=97,
            command=lambda v: count_display.configure(text=str(int(float(v))))
        )
        count_slider.grid(row=0, column=1, padx=(0,10), pady=10, sticky="ew")

        count_display = ctk.CTkLabel(
            self.particle_count_frame,
            text=str(self.count_var.get()),
            width=30,
            text_color="#ffffff"
        )
        count_display.grid(row=0, column=2, pady=10, sticky="w", padx=(10,0))



        button_font = ctk.CTkFont(size=14, weight="bold")  # Ortak font
        load_frame = ctk.CTkFrame(self.right_frame, fg_color="transparent")
        load_frame.pack(pady=(10, 4), padx=5, fill="x")

        # Load PNG
        ctk.CTkButton(
            master=load_frame,
            text="Load PNG",
            font=button_font,
            command=self.load_image_and_convert,
            height=38,
            corner_radius=10,
            fg_color="#2a2a2a",
            hover_color="#3a3a3a"
        ).grid(row=0, column=0, padx=6, pady=6, sticky="ew")

        # Load OBJ
        ctk.CTkButton(
            master=load_frame,
            text="Load OBJ",
            font=button_font,
            command=self.load_obj_file,
            height=38,
            corner_radius=10,
            fg_color="#2a2a2a",
            hover_color="#3a3a3a"
        ).grid(row=0, column=1, padx=6, pady=6, sticky="ew")

        load_frame.grid_columnconfigure((0, 1), weight=1)

        slider_label_font = ctk.CTkFont(size=14, weight="bold")
        value_display_font = ctk.CTkFont(size=12)

        # === PNG SIZE FRAME ===
        self.png_size_frame = ctk.CTkFrame(
            self.right_frame,
            fg_color="#2a2a2a",
            corner_radius=12,
            border_width=1,
            border_color="#444"
        )
        self.png_size_frame.pack(padx=14, pady=(12, 10), fill="x")

        self.png_size_frame.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(
            self.png_size_frame,
            text="PNG Size (px)",
            font=slider_label_font,
            text_color="#ffffff"
        ).grid(row=0, column=0, padx=(10, 10), pady=10, sticky="w")

        self.resize_var = tk.IntVar(value=100)  # Eğer önceden tanımlı değilse

        self.resize_slider = ctk.CTkSlider(
            self.png_size_frame,
            from_=10,
            to=1000,
            variable=self.resize_var,
            number_of_steps=99,
            command=lambda v: self.resize_display.configure(text=f"{int(float(v))} px")
        )
        self.resize_slider.grid(row=0, column=1, padx=(0,10), pady=10, sticky="ew")

        self.resize_display = ctk.CTkLabel(
            self.png_size_frame,
            text=f"{int(self.resize_var.get())} px",
            font=value_display_font,
            text_color="#ffffff",
            width=60
        )
        self.resize_display.grid(row=0, column=2, pady=10, sticky="w", padx=(10,0))


        # === OBJ SCALE FRAME ===
        self.obj_scale_frame = ctk.CTkFrame(
            self.right_frame,
            fg_color="#2a2a2a",
            corner_radius=12,
            border_width=1,
            border_color="#444"
        )
        self.obj_scale_frame.pack(padx=14, pady=(0, 20), fill="x")

        self.obj_scale_frame.grid_columnconfigure(1, weight=1)

        ctk.CTkLabel(
            self.obj_scale_frame,
            text="OBJ Scale (0.1 = 10%)",
            font=slider_label_font,
            text_color="#ffffff"
        ).grid(row=0, column=0, padx=(10, 10), pady=10, sticky="w")

        self.obj_scale_var = tk.DoubleVar(value=1.0)  # Eğer önceden tanımlı değilse

        self.obj_slider = ctk.CTkSlider(
            self.obj_scale_frame,
            from_=0.001,
            to=100.0,
            variable=self.obj_scale_var,
            number_of_steps=999,
            command=lambda v: self.obj_scale_display.configure(text=f"{float(v):.2f}x")
        )
        self.obj_slider.grid(row=0, column=1, padx=(0,10), pady=10, sticky="ew")

        self.obj_scale_display = ctk.CTkLabel(
            self.obj_scale_frame,
            text=f"{self.obj_scale_var.get():.2f}x",
            font=value_display_font,
            text_color="#ffffff",
            width=60
        )
        self.obj_scale_display.grid(row=0, column=2, pady=10, sticky="w", padx=(10,0))







        sequential_frame = ctk.CTkFrame(self.right_frame, fg_color="transparent")
        sequential_frame.pack(pady=6, padx=5, fill="x")

        preview_button = ctk.CTkButton(
            self.right_frame,
            text="3D Preview",
            command=self.export_and_show_vtk,
            fg_color="#2a2a2a",           # Mavi ton (tema renklerinden)
            hover_color="#2a2a2a",
            text_color="white",
            font=ctk.CTkFont(size=14, weight="bold"),
            corner_radius=8,
            height=36
        )
        preview_button.pack(pady=5, padx=10, fill="x")

        ctk.CTkLabel(
            sequential_frame,
            text="Skill Name",
            font=ctk.CTkFont(size=14, weight="bold"),
            anchor="w"
        ).pack(anchor="w", padx=5, pady=(0, 2))

        ctk.CTkEntry(sequential_frame, textvariable=self.skill_name_var).pack(padx=5, fill="x", pady=(0, 10))

        self.sequential_var = ctk.BooleanVar(value=False)
        self.proximity_mode = ctk.BooleanVar(value=False)

        self.mode_checkbox_frame = ctk.CTkFrame(self.right_frame, fg_color="transparent")
        self.mode_checkbox_frame.pack(pady=10, padx=10, fill="x")

        ctk.CTkButton(
            self.right_frame,
            text="Modes",
            command=self.open_modes_window,
            fg_color="#2a2a2a",           # Yeşil ton (tema renklerinden)
            hover_color="#2a2a2a",
            text_color="white",
            font=ctk.CTkFont(size=14, weight="bold"),
            corner_radius=8,
            height=36
        ).pack(pady=10, padx=10, fill="x")

        fps_checkbox_frame = ctk.CTkFrame(self.mode_checkbox_frame, fg_color="transparent")
        fps_checkbox_frame.pack(fill="x", pady=5)

        self.performance_mode = ctk.BooleanVar()
        low_fps_checkbox = ctk.CTkCheckBox(
            fps_checkbox_frame,
            text="Performance Mode",
            variable=self.performance_mode,
            font=ctk.CTkFont(size=13, weight="bold"),
            text_color="#fff"             # Beyaz yazı
        )
        low_fps_checkbox.pack(anchor="center")

        undo_redo_frame = ctk.CTkFrame(self.right_frame, fg_color="transparent")
        undo_redo_frame.pack(pady=10, padx=10, fill="x")

        self.save_fxgen_button = ctk.CTkButton(
            undo_redo_frame,
            text="Save FXGen",
            command=self.save_fxgen_file,
            fg_color=("#2a2a2a"),
            hover_color=("#3a3a3a"),
            text_color="#ffffff",
            border_width=2,
            border_color="#444444",
            corner_radius=15,
            height=35,
            font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold")
        )
        self.save_fxgen_button.pack(padx=10, pady=8, fill="x")

        self.version_frame = ctk.CTkFrame(self.right_frame)
        self.version_frame.pack(side="bottom", pady=8, padx=10, anchor="e")

        self.version_label = ctk.CTkLabel(
            self.version_frame,
            text=LOCAL_VERSION,
            font=ctk.CTkFont(size=10, weight="normal"),
            text_color="#888888"
        )
        self.version_label.grid(row=0, column=0)

        self.settings_button = ctk.CTkButton(
            self.version_frame,
            text="⚙️",
            width=24,
            height=24,
            fg_color="transparent",
            hover_color="#444444",
            command=self.open_settings
        )
        self.settings_button.grid(row=0, column=1, padx=5, pady=5)
        self.add_layer(auto=True)

        # Mirror mode butonları için frame (artık self.right_frame'in child'ı)
        mirror_frame = ctk.CTkFrame(
            self.right_frame, 
            fg_color=("#2a2a2a"),
            corner_radius=15,
            border_width=2,
            border_color="#444444"
        )
        mirror_frame.pack(padx=10, pady=(10, 10), fill="x")

        # Header Label
        header_label = ctk.CTkLabel(
            mirror_frame,
            text="Mirror Controls",
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            text_color="#ffffff"
        )
        header_label.pack(pady=(12, 8))

        # Separator line
        separator = ctk.CTkFrame(
            mirror_frame,
            height=1,
            fg_color="#444444"
        )
        separator.pack(fill="x", padx=20, pady=(0, 10))

        # Checkbox container with grid layout
        checkbox_container = ctk.CTkFrame(mirror_frame, fg_color="transparent")
        checkbox_container.pack(fill="x", padx=15, pady=(0, 15))

        # Premium checkbox styling
        checkbox_font = ctk.CTkFont(family="Segoe UI", size=12, weight="normal")
        hover_color = ("#E2E8F0", "#374151")
        selected_color = ("#3B82F6", "#60A5FA")

        # Mirror Mode checkbox with icon
        self.mirror_checkbox = ctk.CTkCheckBox(
            checkbox_container,
            text="Mirror Mode",
            command=self.toggle_mirror_mode,
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            text_color="#fff",
            fg_color="#2a2a2a",
            hover_color="#3a3a3a",
            border_color="#444444",
            border_width=2,
            corner_radius=8,
            width=26,
            height=26,
            checkbox_width=26,
            checkbox_height=26,
            checkmark_color="#FF3C5F"
        )
        self.mirror_checkbox.pack(padx=10, pady=6, anchor="w")

        # Double Mirror Mode checkbox with icon
        self.double_mirror_checkbox = ctk.CTkCheckBox(
            checkbox_container,
            text="Double Mirror",
            command=self.toggle_double_mirror_mode,
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            text_color="#fff",
            fg_color="#2a2a2a",
            hover_color="#3a3a3a",
            border_color="#444444",
            border_width=2,
            corner_radius=8,
            width=26,
            height=26,
            checkbox_width=26,
            checkbox_height=26,
            checkmark_color="#FF3C5F"
        )
        self.double_mirror_checkbox.pack(padx=10, pady=6, anchor="w")


        # Optional: Add subtle animation effect (if you want to add hover effects)
        def on_checkbox_hover(widget, enter=True):
            if enter:
                widget.configure(text_color="#ffffff")
            else:
                widget.configure(text_color="#ffffff")

        # Bind hover events (optional)
        for checkbox in [self.mirror_checkbox, self.double_mirror_checkbox]:
            checkbox.bind("<Enter>", lambda e, w=checkbox: on_checkbox_hover(w, True))
            checkbox.bind("<Leave>", lambda e, w=checkbox: on_checkbox_hover(w, False))

    # EffectEditorApp içinde:
    def open_settings(self):
        SettingsWindow(self)

    def undo(self, event=None):
        """Geçmişteki bir önceki duruma geri döner."""
        if self.history_index > 0:
            self.history_index -= 1
            self.restore_state_from_history()

    def redo(self, event=None):
        """Geçmişteki bir sonraki duruma ilerler."""
        if self.history_index < len(self.history) - 1:
            self.history_index += 1
            self.restore_state_from_history()

    def restore_state_from_history(self):
        if 0 <= self.history_index < len(self.history):
            self.layers = copy.deepcopy(self.history[self.history_index])

            # Undo sonrası current_layer'i kontrol et, yoksa ilk layer'i ata
            if self.layers:
                self.current_layer = self.layers[0]
            else:
                self.current_layer = None

            self.refresh_layer_cards()
            self.update_layer_selection()
            self.refresh_canvas()

    def update_rotate_speed_label(self, value):
        """Rotate Speed slider'ının değerini günceller."""
        self.rotate_speed_label.configure(text=f"Rotate Speed: {int(float(value))} ticks")

    def save_state_to_history(self):
        """Geçerli durumu geçmişe kaydeder."""
        state = copy.deepcopy(self.layers)
        self.history = self.history[:self.history_index + 1]
        self.history.append(state)
        self.history_index += 1

    def update_target_image(self):
        size = self.target_image_size
        self.target_image = Image.open("target.png").resize((size, size), Image.Resampling.LANCZOS)
        self.target_photo = ImageTk.PhotoImage(self.target_image)
        # Canvas varsa, hedefi yeniden çiz
        if hasattr(self, "canvas") and hasattr(self, "target_id"):
            self.canvas.itemconfig(self.target_id, image=self.target_photo)


    def start_auto_save(self):
        def auto_save_loop():
            while True:
                if getattr(self, "auto_save_enabled", False):
                    try:
                        self.save_fxgen_file(auto=True)
                    except Exception as e:
                        print(f"[Otomatik Kayıt Hatası] {e}")
                time.sleep(getattr(self, "auto_save_interval", 30))

        threading.Thread(target=auto_save_loop, daemon=True).start()

    def open_modes_window(self):
        """Open a window to manage different effect modes with settings and descriptions."""
        # Check if window is already open
        if WindowManager.is_open("modes_window"):
            try:
                WindowManager.focus_window("modes_window")
            except Exception as e:
                print(f"Error focusing window: {e}")
                WindowManager.close_window("modes_window")
            return

        # Modern color palette
        COLOR_PALETTE = {
            "dark_bg": "#1e1e1e",
            "card_bg": "#252525",
            "header_bg": "#2a2a2a",
            "accent": "#121212",
            "accent_hover": "#4a2a2a",
            "accent_light": "#c13b54",
            "text_main": "#ffffff",
            "text_secondary": "#cccccc",
            "border": "#444444"
        }

        # Window setup with improved styling
        modes_window = ctk.CTkToplevel(self)
        modes_window.title("Modes Configuration")
        modes_window.geometry("480x620")  # Slightly larger for better spacing
        modes_window.resizable(True, True)
        modes_window.configure(fg_color=COLOR_PALETTE["dark_bg"])
        WindowManager.open_window("modes_window", modes_window)
        modes_window.grab_set()

        # Title section with improved styling
        title_frame = ctk.CTkFrame(modes_window, fg_color=COLOR_PALETTE["header_bg"], height=60)
        title_frame.pack(fill="x", padx=0, pady=0)
        # Force the frame to keep its height
        title_frame.pack_propagate(False)
        
        # Title with better padding and font
        ctk.CTkLabel(
            title_frame, 
            text="EFFECT MODES", 
            font=ctk.CTkFont(family="Segoe UI", size=18, weight="bold"),
            text_color=COLOR_PALETTE["text_main"]
        ).pack(side="left", padx=20, pady=15)
        
        # Help button with improved styling
        help_btn = ctk.CTkButton(
            title_frame,
            text="?",
            width=36,
            height=36,
            corner_radius=18,
            fg_color=COLOR_PALETTE["accent"],
            hover_color=COLOR_PALETTE["accent_light"],
            text_color=COLOR_PALETTE["text_main"],
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            command=lambda: messagebox.showinfo(
                "Help", 
                "Enable different effect modes and configure them using the Settings buttons."
            )
        )
        help_btn.pack(side="right", padx=20, pady=15)

        # Modes container with better spacing
        modes_container = ctk.CTkScrollableFrame(
            modes_window, 
            fg_color=COLOR_PALETTE["dark_bg"],
            height=520,
            border_width=0
        )
        modes_container.pack(fill="both", expand=True, padx=15, pady=15)

        # Mode definitions
        MODES = [
            {
                "name": "Rotate Mode",
                "var": self.rotate_mode,
                "desc": "Allows your effects to rotate over time.",
                "settings": self.open_rotate_modes_settings,
                "icon": "🔄"  # Added icons for visual appeal
            },
            {
                "name": "Local Rotate Mode",
                "var": self.local_rotate_mode,
                "desc": "A different type of rotation mode.",
                "settings": self.open_local_rotate_settings,
                "icon": "🔁"
            },
            {
                "name": "Rise Mode",
                "var": self.rise_mode,
                "desc": "Makes effects slowly rise upwards.",
                "settings": self.open_rise_settings,
                "icon": "⬆️"
            },
            {
                "name": "Persistent Effect Mode",
                "var": self.persistent_mode,
                "desc": "Creates long-lasting effects.",
                "settings": None,
                "icon": "✨"
            },
            {
                "name": "Proximity Mode",
                "var": self.proximity_mode,
                "desc": "Sorts effects based on their distance to the center.",
                "settings": self.open_proximity_settings,
                "icon": "📏"
            },
            {
                "name": "Performance Mode",
                "var": self.performance_mode,
                "desc": "Optimizes performance for large effects.",
                "settings": None,
                "icon": "⚡"
            },
            {
                "name": "Rainbow Mode",
                "var": self.rainbow_mode,
                "desc": "Color of each particle will dynamically cycle through the rainbow.",
                "settings": None,
                "icon": "🌈"
            },
            {
                "name": "Image Color Mode",
                "var": self.image_color_mode,
                "desc": "Draw the PNG in its original colors when enabled.",
                "settings": None,
                "icon": "🎨"
            },
        ]

        # Create mode widgets with improved styling
        for mode in MODES:
            mode_frame = ctk.CTkFrame(modes_container, fg_color=COLOR_PALETTE["card_bg"], corner_radius=8, border_width=1, border_color=COLOR_PALETTE["border"])
            mode_frame.pack(fill="x", pady=6, padx=5)

            # Mode icon and name container
            mode_left_frame = ctk.CTkFrame(mode_frame, fg_color="transparent")
            mode_left_frame.pack(side="left", fill="y", padx=10, pady=10)
            
            # Icon
            ctk.CTkLabel(
                mode_left_frame, 
                text=mode["icon"],
                font=ctk.CTkFont(family="Segoe UI", size=16),
                width=30
            ).pack(side="left", padx=(0, 6))
            
            # Mode checkbox with better styling
            ctk.CTkCheckBox(
                mode_left_frame, 
                text=mode["name"],
                variable=mode["var"],
                text_color=COLOR_PALETTE["text_main"],
                font=ctk.CTkFont(family="Segoe UI", size=13, weight="bold"),
                fg_color=COLOR_PALETTE["accent"],
                border_color=COLOR_PALETTE["border"],
                hover_color=COLOR_PALETTE["accent_light"],
                corner_radius=5,
                checkbox_height=22,
                checkbox_width=22
            ).pack(side="left", padx=0, pady=0)

            # Right side buttons container
            buttons_frame = ctk.CTkFrame(mode_frame, fg_color="transparent")
            buttons_frame.pack(side="right", padx=10, pady=10)

            # Info button with better styling
            info_btn = ctk.CTkButton(
                buttons_frame,
                text="Info",
                width=70,
                height=28,
                corner_radius=5,
                fg_color=COLOR_PALETTE["accent"],
                hover_color=COLOR_PALETTE["accent_light"],
                text_color=COLOR_PALETTE["text_main"],
                font=ctk.CTkFont(family="Segoe UI", size=12),
                command=lambda desc=mode["desc"]: messagebox.showinfo(
                    "Mode Information", 
                    desc
                )
            )
            info_btn.pack(side="right", padx=(5, 0))

            # Settings button if available
            if mode["settings"]:
                settings_btn = ctk.CTkButton(
                    buttons_frame,
                    text="Settings",
                    width=85,
                    height=28,
                    corner_radius=5,
                    fg_color=COLOR_PALETTE["accent"],
                    hover_color=COLOR_PALETTE["accent_light"],
                    text_color=COLOR_PALETTE["text_main"],
                    font=ctk.CTkFont(family="Segoe UI", size=12),
                    command=mode["settings"]
                )
                settings_btn.pack(side="right", padx=(5, 0))

        # Close handler
        def on_close():
            WindowManager.close_window("modes_window")
            modes_window.destroy()

        modes_window.protocol("WM_DELETE_WINDOW", on_close)

    def open_rotate_modes_settings(self):
        """Open main rotation settings window with modern dark/burgundy theme"""
        if WindowManager.is_open("rotate_modes_settings"):
            WindowManager.focus_window("rotate_modes_settings")
            return

        # Modern enhanced color palette
        COLOR_PALETTE = {
            "dark_bg": "#1e1e1e",
            "card_bg": "#252525",
            "header_bg": "#2a2a2a",
            "accent": "#121212",
            "accent_light": "#c13b54",
            "accent_hover": "#4a2a2a",
            "text_main": "#ffffff",
            "text_secondary": "#cccccc",
            "slider_bg": "#3a3a3a",
            "slider_progress": "#c13b54",
            "border": "#444444"
        }
        
        # Window setup
        settings_win = ctk.CTkToplevel(self)
        settings_win.title("Rotation Settings")
        settings_win.geometry("450x320")  # Slightly larger for better spacing
        settings_win.resizable(False, False)
        settings_win.configure(fg_color=COLOR_PALETTE["dark_bg"])
        WindowManager.open_window("rotate_modes_settings", settings_win)
        settings_win.grab_set()

        # Make window always appear on top
        settings_win.attributes('-topmost', True)
        settings_win.after(100, lambda: settings_win.attributes('-topmost', False))

        # Title bar and content separation
        header_frame = ctk.CTkFrame(settings_win, fg_color=COLOR_PALETTE["header_bg"], height=60)
        header_frame.pack(fill="x", padx=0, pady=0)
        header_frame.pack_propagate(False)  # Force frame to keep its height
        
        ctk.CTkLabel(
            header_frame,
            text="ROTATION CONTROL",
            font=ctk.CTkFont(family="Segoe UI", size=16, weight="bold"),
            text_color=COLOR_PALETTE["text_main"]
        ).pack(side="left", padx=20, pady=15)

        # Icon for visual appeal
        ctk.CTkLabel(
            header_frame,
            text="🔄",
            font=ctk.CTkFont(family="Segoe UI", size=18),
            text_color=COLOR_PALETTE["text_main"]
        ).pack(side="right", padx=20, pady=15)

        # Main container with better padding
        main_frame = ctk.CTkFrame(settings_win, fg_color=COLOR_PALETTE["dark_bg"])
        main_frame.pack(pady=20, padx=20, fill="both", expand=True)

        # Global rotation control with visual enhancement
        temp_rotate_speed = ctk.IntVar(value=self.rotate_speed.get())
        
        # Speed slider container
        slider_frame = ctk.CTkFrame(main_frame, fg_color=COLOR_PALETTE["card_bg"], corner_radius=8, border_width=1, border_color=COLOR_PALETTE["border"])
        slider_frame.pack(fill="x", pady=10, padx=0)
        
        # Slider label with icon
        slider_label_frame = ctk.CTkFrame(slider_frame, fg_color="transparent")
        slider_label_frame.pack(fill="x", padx=15, pady=(15, 5))
        
        ctk.CTkLabel(
            slider_label_frame,
            text="Global Speed",
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            text_color=COLOR_PALETTE["text_main"]
        ).pack(side="left")
        
        # Value display
        value_label = ctk.CTkLabel(
            slider_label_frame,
            text=f"{temp_rotate_speed.get()}",
            font=ctk.CTkFont(family="Segoe UI", size=14),
            text_color=COLOR_PALETTE["accent_light"]
        )
        value_label.pack(side="right")
        
        # Slider with better styling
        slider = ctk.CTkSlider(
            slider_frame,
            from_=1,
            to=100,
            variable=temp_rotate_speed,
            width=380,
            height=22,
            border_width=0,
            fg_color=COLOR_PALETTE["slider_bg"],
            progress_color=COLOR_PALETTE["slider_progress"],
            button_color=COLOR_PALETTE["accent_light"],
            button_hover_color=COLOR_PALETTE["accent_hover"],
            command=lambda val: value_label.configure(text=f"{int(val)}")
        )
        slider.pack(padx=15, pady=(5, 15))

        # Local rotation settings button with better styling
        local_button = ctk.CTkButton(
            main_frame,
            text="Local Rotation Settings",
            command=self.open_local_rotate_settings,
            fg_color=COLOR_PALETTE["card_bg"],
            hover_color=COLOR_PALETTE["accent_hover"],
            border_color=COLOR_PALETTE["border"],
            border_width=1,
            text_color=COLOR_PALETTE["text_main"],
            font=ctk.CTkFont(family="Segoe UI", size=13),
            height=38,
            corner_radius=8,
            image=None,  # You can add an image here if available
        )
        local_button.pack(fill="x", pady=(10, 20))

        # Apply button with visual enhancement
        apply_button = ctk.CTkButton(
            main_frame,
            text="APPLY SETTINGS",
            command=lambda: self._save_rotation_settings(
                temp_rotate_speed.get(),
                settings_win
            ),
            fg_color=COLOR_PALETTE["accent"],
            hover_color=COLOR_PALETTE["accent_light"],
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            height=40,
            corner_radius=8
        )
        apply_button.pack(fill="x", pady=(0, 5))

        settings_win.protocol("WM_DELETE_WINDOW", 
            lambda: self._close_window(settings_win, "rotate_modes_settings"))

    def open_local_rotate_settings(self):
        if WindowManager.is_open("local_rotate_settings"):
            WindowManager.focus_window("local_rotate_settings")
            return

        # Modern enhanced color palette
        COLOR_PALETTE = {
            "dark_bg": "#1e1e1e",
            "card_bg": "#252525",
            "header_bg": "#2a2a2a",
            "accent": "#121212",
            "accent_light": "#c13b54",
            "accent_hover": "#4a2a2a",
            "text_main": "#ffffff",
            "text_secondary": "#cccccc",
            "slider_bg": "#3a3a3a",
            "slider_progress": "#c13b54",
            "border": "#444444"
        }

        local_win = ctk.CTkToplevel(self)
        local_win.title("Local Rotation Settings")
        local_win.geometry("450x500")  # Slightly larger for better spacing
        local_win.resizable(False, False)
        local_win.configure(fg_color=COLOR_PALETTE["dark_bg"])
        WindowManager.open_window("local_rotate_settings", local_win)
        local_win.grab_set()

        local_win.attributes('-topmost', True)
        local_win.after(100, lambda: local_win.attributes('-topmost', False))

        # Title bar with enhanced styling
        header_frame = ctk.CTkFrame(local_win, fg_color=COLOR_PALETTE["header_bg"], height=60)
        header_frame.pack(fill="x", padx=0, pady=0)
        header_frame.pack_propagate(False)  # Force frame to keep its height
        
        ctk.CTkLabel(
            header_frame,
            text="LOCAL ROTATION SETTINGS",
            font=ctk.CTkFont(family="Segoe UI", size=16, weight="bold"),
            text_color=COLOR_PALETTE["text_main"]
        ).pack(side="left", padx=20, pady=15)

        # Icon for visual appeal
        ctk.CTkLabel(
            header_frame,
            text="🔁",
            font=ctk.CTkFont(family="Segoe UI", size=18),
            text_color=COLOR_PALETTE["text_main"]
        ).pack(side="right", padx=20, pady=15)

        # Main container with proper spacing
        main_frame = ctk.CTkFrame(local_win, fg_color=COLOR_PALETTE["dark_bg"])
        main_frame.pack(pady=20, padx=20, fill="both", expand=True)

        # Image or informational element for better UX
        info_frame = ctk.CTkFrame(main_frame, fg_color=COLOR_PALETTE["card_bg"], corner_radius=8, border_width=1, border_color=COLOR_PALETTE["border"])
        info_frame.pack(fill="x", pady=(0, 20), padx=0)
        
        ctk.CTkLabel(
            info_frame,
            text="Configure how effects rotate around their own center",
            font=ctk.CTkFont(family="Segoe UI", size=13),
            text_color=COLOR_PALETTE["text_secondary"],
            wraplength=380
        ).pack(pady=15, padx=15)

        # Rotation Speed slider with enhanced visuals
        speed_frame = ctk.CTkFrame(main_frame, fg_color=COLOR_PALETTE["card_bg"], corner_radius=8, border_width=1, border_color=COLOR_PALETTE["border"])
        speed_frame.pack(fill="x", pady=10, padx=0)
        
        # Speed slider label with icon
        speed_label_frame = ctk.CTkFrame(speed_frame, fg_color="transparent")
        speed_label_frame.pack(fill="x", padx=15, pady=(15, 5))
        
        ctk.CTkLabel(
            speed_label_frame,
            text="Rotation Speed",
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            text_color=COLOR_PALETTE["text_main"]
        ).pack(side="left")
        
        # Value display
        speed_value_label = ctk.CTkLabel(
            speed_label_frame,
            text=f"{self.local_rotate_speed.get():.1f}",
            font=ctk.CTkFont(family="Segoe UI", size=14),
            text_color=COLOR_PALETTE["accent_light"]
        )
        speed_value_label.pack(side="right")
        
        # Speed slider with better styling
        speed_slider = ctk.CTkSlider(
            speed_frame,
            from_=0.1,
            to=10.0,
            variable=self.local_rotate_speed,
            width=380,
            height=22,
            border_width=0,
            fg_color=COLOR_PALETTE["slider_bg"],
            progress_color=COLOR_PALETTE["slider_progress"],
            button_color=COLOR_PALETTE["accent_light"],
            button_hover_color=COLOR_PALETTE["accent_hover"],
            command=lambda val: speed_value_label.configure(text=f"{val:.1f}")
        )
        speed_slider.pack(padx=15, pady=(5, 15))

        # Radius slider with enhanced visuals
        radius_frame = ctk.CTkFrame(main_frame, fg_color=COLOR_PALETTE["card_bg"], corner_radius=8, border_width=1, border_color=COLOR_PALETTE["border"])
        radius_frame.pack(fill="x", pady=10, padx=0)
        
        # Radius slider label
        radius_label_frame = ctk.CTkFrame(radius_frame, fg_color="transparent")
        radius_label_frame.pack(fill="x", padx=15, pady=(15, 5))
        
        ctk.CTkLabel(
            radius_label_frame,
            text="Radius (Distance from center)",
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            text_color=COLOR_PALETTE["text_main"]
        ).pack(side="left")
        
        # Value display
        radius_value_label = ctk.CTkLabel(
            radius_label_frame,
            text=f"{self.local_rotate_radius.get():.1f}",
            font=ctk.CTkFont(family="Segoe UI", size=14),
            text_color=COLOR_PALETTE["accent_light"]
        )
        radius_value_label.pack(side="right")
        
        # Radius slider with better styling
        radius_slider = ctk.CTkSlider(
            radius_frame,
            from_=0.1,
            to=10.0,
            variable=self.local_rotate_radius,
            width=380,
            height=22,
            border_width=0,
            fg_color=COLOR_PALETTE["slider_bg"],
            progress_color=COLOR_PALETTE["slider_progress"],
            button_color=COLOR_PALETTE["accent_light"],
            button_hover_color=COLOR_PALETTE["accent_hover"],
            command=lambda val: radius_value_label.configure(text=f"{val:.1f}")
        )
        radius_slider.pack(padx=15, pady=(5, 15))

        # Apply button with visual enhancement
        apply_button = ctk.CTkButton(
            main_frame,
            text="APPLY SETTINGS",
            command=lambda: self._save_local_rotation_settings(
                self.local_rotate_speed.get(),
                self.local_rotate_radius.get(),
                local_win
            ),
            fg_color=COLOR_PALETTE["accent"],
            hover_color=COLOR_PALETTE["accent_light"],
            font=ctk.CTkFont(family="Segoe UI", size=14, weight="bold"),
            height=40,
            corner_radius=8
        )
        apply_button.pack(fill="x", pady=(20, 5))

        local_win.protocol("WM_DELETE_WINDOW", 
            lambda: self._close_window(local_win, "local_rotate_settings"))
        
    
    def open_proximity_settings(self):
        """Open Proximity Mode settings window with dark red theme"""
        if hasattr(self, "proximity_window") and self.proximity_window.winfo_exists():
            self.proximity_window.lift()
            return

        # Color palette
        DARK_BG = "#2a2a2a"  # Dark background
        CARD_BG = "#2a2a2a"  # Dark red/burgundy
        TEXT_MAIN = "#ffffff"  # White text
        TEXT_SECONDARY = "#121212"  # Light red text
        INPUT_BG = "#121212"  # Darker red input field
        ACCENT = "#121212"  # Stronger red for accents

        # Window setup
        self.proximity_window = ctk.CTkToplevel(self)
        self.proximity_window.title("Proximity Mode Configuration")
        self.proximity_window.geometry("350x320")
        self.proximity_window.resizable(False, False)
        self.proximity_window.configure(fg_color=DARK_BG)
        self.proximity_window.grab_set()

        # Make window appear on top temporarily
        self.proximity_window.attributes('-topmost', True)
        self.proximity_window.after(100, lambda: self.proximity_window.attributes('-topmost', False))

        # Main container
        main_frame = ctk.CTkFrame(self.proximity_window, fg_color=DARK_BG)
        main_frame.pack(pady=15, padx=15, fill="both", expand=True)

        # Header
        ctk.CTkLabel(
            main_frame,
            text="PROXIMITY SETTINGS",
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color=ACCENT
        ).pack(pady=(0, 15))

        # Settings container
        settings_frame = ctk.CTkFrame(main_frame, fg_color=CARD_BG, corner_radius=8)
        settings_frame.pack(fill="x", pady=5)

        # Sequential Step Control
        ctk.CTkLabel(
            settings_frame,
            text="Lines Between Delays:",
            font=ctk.CTkFont(size=12),
            text_color=TEXT_MAIN
        ).pack(pady=(12, 5), padx=15, anchor="w")

        step_entry = ctk.CTkEntry(
            settings_frame,
            textvariable=self.sequential_step_var,
            fg_color=INPUT_BG,
            text_color=TEXT_MAIN,
            border_color=ACCENT,
            corner_radius=6,
            font=ctk.CTkFont(family="Consolas", size=12)
        )
        step_entry.pack(fill="x", padx=15, pady=(0, 10))

        # Delay Time Control
        ctk.CTkLabel(
            settings_frame,
            text="Delay Duration (ticks):",
            font=ctk.CTkFont(size=12),
            text_color=TEXT_MAIN
        ).pack(pady=(5, 5), padx=15, anchor="w")

        delay_entry = ctk.CTkEntry(
            settings_frame,
            textvariable=self.delay_var,
            fg_color=INPUT_BG,
            text_color=TEXT_MAIN,
            border_color=ACCENT,
            corner_radius=6,
            font=ctk.CTkFont(family="Consolas", size=12)
        )
        delay_entry.pack(fill="x", padx=15, pady=(0, 15))

        # Button frame
        button_frame = ctk.CTkFrame(main_frame, fg_color="transparent")
        button_frame.pack(fill="x", pady=(10, 0))

        def apply_settings():
            """Validate and apply proximity settings"""
            try:
                step = int(self.sequential_step_var.get())
                delay = float(self.delay_var.get())
                
                if step <= 0 or delay <= 0:
                    raise ValueError("Values must be greater than zero")
                    
                self.proximity_window.destroy()
                self.proximity_window = None
                
            except ValueError as e:
                messagebox.showerror(
                    "Invalid Input",
                    f"Please enter valid positive numbers.\nError: {str(e)}"
                )
                step_entry.focus_set()

        # Apply button
        ctk.CTkButton(
            button_frame,
            text="APPLY SETTINGS",
            command=apply_settings,
            fg_color=ACCENT,
            hover_color="#a52a2a",  # Lighter red on hover
            font=ctk.CTkFont(size=12, weight="bold"),
            height=35,
            corner_radius=8
        ).pack(fill="x")

        # Close handler
        def on_close():
            if hasattr(self, "proximity_window"):
                self.proximity_window.destroy()
                self.proximity_window = None

        self.proximity_window.protocol("WM_DELETE_WINDOW", on_close)


    def open_rise_settings(self):
        """Open Rise Mode settings window with modern dark theme"""
        if WindowManager.is_open("rise_settings"):
            WindowManager.focus_window("rise_settings")
            return

        # Modern color palette
        COLOR_PALETTE = {
            "dark_bg": "#1e1e1e",
            "card_bg": "#2a2a2a",
            "accent": "#121212",  # Burgundy accent
            "accent_light": "#c13b54",
            "text_main": "#ffffff",
            "text_secondary": "#b0b0b0",
            "input_bg": "#121212"
        }

        # Window setup
        popup = ctk.CTkToplevel(self)
        popup.title("Rise Mode Configuration")
        popup.geometry("380x300")
        popup.resizable(False, False)
        popup.configure(fg_color=COLOR_PALETTE["dark_bg"])
        WindowManager.open_window("rise_settings", popup)
        popup.grab_set()

        # Make window appear on top temporarily
        popup.attributes('-topmost', True)
        popup.after(100, lambda: popup.attributes('-topmost', False))

        # Main container
        main_frame = ctk.CTkFrame(popup, fg_color=COLOR_PALETTE["dark_bg"])
        main_frame.pack(pady=15, padx=20, fill="both", expand=True)

        # Header
        ctk.CTkLabel(
            main_frame,
            text="RISE EFFECT SETTINGS",
            font=ctk.CTkFont(family="Segoe UI", size=16, weight="bold"),
            text_color=COLOR_PALETTE["accent"]
        ).pack(pady=(0, 15))

        # Settings container
        settings_frame = ctk.CTkFrame(main_frame, fg_color=COLOR_PALETTE["card_bg"], corner_radius=8)
        settings_frame.pack(fill="x", pady=5)

        # Rise Speed Control
        ctk.CTkLabel(
            settings_frame,
            text="Rise Speed (blocks/tick):",
            font=ctk.CTkFont(family="Segoe UI", size=12),
            text_color=COLOR_PALETTE["text_main"]
        ).pack(pady=(12, 5), padx=15, anchor="w")

        speed_entry = ctk.CTkEntry(
            settings_frame,
            textvariable=self.rise_speed_var,
            fg_color=COLOR_PALETTE["input_bg"],
            text_color=COLOR_PALETTE["text_main"],
            border_color=COLOR_PALETTE["accent"],
            corner_radius=6,
            font=ctk.CTkFont(family="Consolas", size=12)
        )
        speed_entry.pack(fill="x", padx=15, pady=(0, 10))

        # Rise Limit Control
        ctk.CTkLabel(
            settings_frame,
            text="Maximum Height (blocks):",
            font=ctk.CTkFont(family="Segoe UI", size=12),
            text_color=COLOR_PALETTE["text_main"]
        ).pack(pady=(5, 5), padx=15, anchor="w")

        limit_entry = ctk.CTkEntry(
            settings_frame,
            textvariable=self.rise_limit_var,
            fg_color=COLOR_PALETTE["input_bg"],
            text_color=COLOR_PALETTE["text_main"],
            border_color=COLOR_PALETTE["accent"],
            corner_radius=6,
            font=ctk.CTkFont(family="Consolas", size=12)
        )
        limit_entry.pack(fill="x", padx=15, pady=(0, 15))

        # Button frame
        button_frame = ctk.CTkFrame(main_frame, fg_color="transparent")
        button_frame.pack(fill="x", pady=(10, 0))

        def apply_settings():
            """Validate and apply rise settings"""
            try:
                speed = float(self.rise_speed_var.get())
                limit = float(self.rise_limit_var.get())
                
                if speed < 0 or limit < 0:
                    raise ValueError("Values must be positive numbers")
                    
                if speed > 10:
                    if not messagebox.askyesno(
                        "Warning", 
                        "High rise speed may cause performance issues. Continue?"
                    ):
                        return
                        
                WindowManager.close_window("rise_settings")
                popup.destroy()
                
                # Start rise effect if mode is enabled
                if self.rise_mode.get():
                    self.apply_rise_effect()
                    
            except ValueError as e:
                messagebox.showerror(
                    "Invalid Input",
                    f"Please enter valid positive numbers.\nError: {str(e)}"
                )
                speed_entry.focus_set()

        # Apply button
        ctk.CTkButton(
            button_frame,
            text="APPLY SETTINGS",
            command=apply_settings,
            fg_color=COLOR_PALETTE["accent"],
            hover_color=COLOR_PALETTE["accent_light"],
            font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"),
            height=35,
            corner_radius=8
        ).pack(fill="x")

        # Close handler
        def on_close():
            WindowManager.close_window("rise_settings")
            popup.destroy()

        popup.protocol("WM_DELETE_WINDOW", on_close)

    def apply_rise_effect(self):
        """Apply the rising effect to all elements"""
        if not self.rise_mode.get():
            return  # Mode is disabled

        try:
            rise_speed = float(self.rise_speed_var.get())
            rise_limit = float(self.rise_limit_var.get())
            
            if rise_speed <= 0 or rise_limit <= 0:
                return
                
            elements_updated = 0
            
            for layer in self.layers:
                for element in layer.elements:
                    if element.y_offset < rise_limit:
                        # Calculate new position
                        new_offset = element.y_offset + rise_speed
                        element.y_offset = min(new_offset, rise_limit)
                        
                        # Update canvas position if exists
                        if hasattr(element, "canvas_id") and element.canvas_id:
                            self.canvas.move(element.canvas_id, 0, -rise_speed)
                            elements_updated += 1
            
            # Only refresh if we actually moved elements
            if elements_updated > 0:
                self.refresh_canvas()
                
            # Schedule next update (adjust timing as needed)
            self.after(50, self.apply_rise_effect)
            
        except (ValueError, AttributeError) as e:
            print(f"[Rise Effect Error] {str(e)}")
            self.rise_mode.set(False)  # Disable mode on error




    def _create_slider(self, parent, title, variable, min_val, max_val, color_palette, decimal_places=0):
        """Create a consistent modern slider control"""
        frame = ctk.CTkFrame(parent, fg_color=color_palette["card_bg"], corner_radius=8)
        frame.pack(fill="x", pady=5)

        # Title and value display
        title_frame = ctk.CTkFrame(frame, fg_color="transparent")
        title_frame.pack(fill="x", padx=12, pady=(10, 5))
        
        ctk.CTkLabel(
            title_frame,
            text=title,
            font=ctk.CTkFont(family="Segoe UI", size=13),
            text_color=color_palette["text_main"]
        ).pack(side="left")

        value_label = ctk.CTkLabel(
            title_frame,
            textvariable=variable,
            font=ctk.CTkFont(family="Segoe UI", size=12, weight="bold"),
            text_color=color_palette["accent"]
        )
        value_label.pack(side="right")

        # Slider with custom styling
        slider = ctk.CTkSlider(
            frame,
            from_=min_val,
            to=max_val,
            variable=variable,
            number_of_steps=int((max_val-min_val)*10) if decimal_places else 99,
            progress_color=color_palette["accent"],
            button_color=color_palette["text_main"],
            button_hover_color=color_palette["accent_light"],
            fg_color=color_palette["slider_bg"]
        )
        slider.pack(padx=12, pady=(0, 10), fill="x")

        # Range indicators
        range_frame = ctk.CTkFrame(frame, fg_color="transparent")
        range_frame.pack(fill="x", padx=12, pady=(0, 8))

        ctk.CTkLabel(
            range_frame,
            text=f"Min: {min_val}",
            font=ctk.CTkFont(family="Segoe UI", size=10),
            text_color=color_palette["text_secondary"]
        ).pack(side="left")

        ctk.CTkLabel(
            range_frame,
            text=f"Max: {max_val}",
            font=ctk.CTkFont(family="Segoe UI", size=10),
            text_color=color_palette["text_secondary"]
        ).pack(side="right")

    def _save_rotation_settings(self, speed, window):
        """Save global rotation settings"""
        self.rotate_speed.set(speed)
        self._close_window(window, "rotate_modes_settings")

    def _save_local_rotation_settings(self, speed, radius, window):
        self.local_rotate_speed.set(speed)
        self.local_rotate_radius.set(radius)
        self.local_rotate_mode.set(True)
        window.destroy()


    def _close_window(self, window, window_name):
        """Safely close a window"""
        try:
            WindowManager.close_window(window_name)
            window.destroy()
        except Exception as e:
            print(f"Error closing window: {e}")



    
    def add_selected_effect_to_code(self):
        selected_effect = self.effect_type_var.get()
        code_line = f"  - effect{{type={selected_effect}}}\n"
        self.output_box.insert("end", code_line)

    def on_mousewheel_zoom(self, event):
        if event.delta > 0 or event.num == 4:
            factor = 1.1
        else:
            factor = 0.9

        # Store the old scale for coordinate conversion
        old_scale = self.canvas_scale
        self.canvas_scale *= factor

        # Scale only the visual elements
        self.canvas.scale("all", event.x, event.y, factor, factor)

        # Update the stored coordinates of all elements to maintain their relative positions
        if self.current_layer:
            for element in self.current_layer.elements:
                if hasattr(element, "canvas_id"):
                    # Get the current canvas coordinates
                    coords = self.canvas.coords(element.canvas_id)
                    if len(coords) >= 2:
                        # Convert canvas coordinates back to world coordinates
                        width = self.canvas.winfo_width()
                        height = self.canvas.winfo_height()
                        center_x = width // 2
                        center_y = height // 2
                        
                        # Calculate new world coordinates
                        x = coords[0] + (coords[2] - coords[0])/2
                        y = coords[1] + (coords[3] - coords[1])/2
                        
                        # Update element's position
                        xoff = (x - center_x) / 10 / self.canvas_scale
                        zoff = (y - center_y) / 10 / self.canvas_scale
                        element.position = (xoff, zoff)

    def update_tick_value(self):
        try:
            tick = int(self.tick_var.get())
            if self.current_layer:
                self.current_layer.tick_start = tick
                self.current_layer.tick_end = tick
        except:
            print("Geçersiz tick değeri")

    def start_autosave_loop(self):
        if not self.autosave_enabled:
            return

        try:
            interval = int(self.autosave_interval) * 1000  # saniyeyi milisaniyeye çevir
        except ValueError:
            print("Geçersiz otomatik kayıt aralığı.")
            return

        self.save_fxgen_file(auto=True)
        self.after(interval, self.start_autosave_loop)

    def apply_rise_effect(self):
        if not self.rise_mode.get():
            print("[DEBUG] Rise Mode is disabled.")
            return  

        for layer in self.layers:
            if not layer.elements:
                continue


            rise_speed = getattr(layer, "rise_speed", self.rise_speed_var.get())
            rise_limit = getattr(layer, "rise_limit", self.rise_limit_var.get())

            for element in layer.elements:
                if element.y_offset < rise_limit:  
                    element.y_offset += rise_speed  
                    print(f"[DEBUG] Updated y_offset for element: {element.y_offset}")


                    if hasattr(element, "canvas_id") and element.canvas_id:
                        coords = self.canvas.coords(element.canvas_id)
                        if len(coords) >= 4:

                            self.canvas.move(element.canvas_id, 0, -rise_speed * 10)
                            print(f"[DEBUG] Moved canvas element {element.canvas_id} by {-rise_speed * 10} on Y-axis.")

        self.refresh_canvas()  
        print("[DEBUG] Canvas refreshed.")


        self.after(1000, self.apply_rise_effect)
    def update_shape_size_display(self, value, shape_size_display, block_size_label):
        shape_size_display.configure(text=str(int(float(value))))
        block_size_label.configure(text=f"(r={float(value)/10:.1f} )")
    def show_particle_list(self):
        if not self.current_layer:
            messagebox.showwarning("No Layer", "Please create a layer first. or select a layer.")
            return

        if getattr(self, 'particle_window', None) is not None and self.particle_window.winfo_exists():
            self.particle_window.lift()
            return

        self.particle_window = ctk.CTkToplevel(self)
        self.particle_window.title("Select Particle")
        self.particle_window.geometry("320x500")
        self.particle_window.resizable(False, False)
        self.particle_window.focus_force()
        self.particle_window.grab_set()

        def on_close():
            self.particle_window.destroy()
            self.particle_window = None

        self.particle_window.protocol("WM_DELETE_WINDOW", on_close)

        main_frame = ctk.CTkFrame(self.particle_window, corner_radius=10)
        main_frame.pack(expand=True, fill="both", padx=15, pady=15)

        title_label = ctk.CTkLabel(
            main_frame,
            text=" Select Particle",
            font=("Segoe UI", 18, "bold"),
            text_color=self.text_color
        )
        title_label.pack(pady=(10, 5))

        search_var = tk.StringVar()
        search_entry = ctk.CTkEntry(
            main_frame,
            placeholder_text="Search..",
            textvariable=search_var,
            height=30
        )
        search_entry.pack(pady=(0, 10), padx=10, fill="x")

        listbox_frame = ctk.CTkFrame(main_frame, corner_radius=5)
        listbox_frame.pack(expand=True, fill="both", pady=(5, 10))

        particle_listbox = tk.Listbox(
            listbox_frame,
            bg=self.sidebar_color,
            fg=self.text_color,
            selectbackground=self.button_color,
            selectforeground=self.text_color,
            highlightthickness=0,
            font=("Segoe UI", 12),
            activestyle="none"
        )
        particle_listbox.pack(expand=True, fill="both", padx=5, pady=5)

        # Tüm partikülleri listbox'a ekle
        def update_filter(*args):
            search_term = search_var.get().lower()
            particle_listbox.delete(0, tk.END)
            for name in self.particle_list:
                if search_term in name.lower():
                    particle_listbox.insert(tk.END, name)

        search_var.trace_add("write", update_filter)

        # Seçilen partikülü uygula ve pencereyi kapat
        def select_particle(event=None):
            selected = particle_listbox.curselection()
            if selected:
                selected_particle = particle_listbox.get(selected[0])
                self.particle_var.set(selected_particle)
                if self.current_layer:
                    self.current_layer.particle = selected_particle
                self.refresh_layer_cards()
                self.particle_window.destroy()
            else:
                messagebox.showwarning("Warning", "Please select a particle.")

        # Yeni partikül ekleme fonksiyonu
        def add_custom_particle():
            new_particle = simpledialog.askstring("New Particle", "Enter particle name:")
            if new_particle:
                if new_particle not in self.particle_list:
                    self.particle_list.append(new_particle)
                self.particle_var.set(new_particle)
                if self.current_layer:
                    self.current_layer.particle = new_particle
                self.refresh_layer_cards()
                self.particle_window.destroy()

        select_button = ctk.CTkButton(
            main_frame,
            text="Select",
            command=select_particle,
            height=30
        )
        select_button.pack(pady=(0, 5), padx=10, fill="x")

        add_button = ctk.CTkButton(
            main_frame,
            text="+ Add Particle",
            hover_color="#5598db",
            fg_color="#3a7ebf",
            command=add_custom_particle,
            height=30
        )
        add_button.pack(pady=(0, 5), padx=10, fill="x")

        particle_listbox.bind("<Double-Button-1>", select_particle)
        particle_listbox.bind("<Return>", select_particle)

        update_filter()

        button_frame = ctk.CTkFrame(main_frame, fg_color="transparent")
        button_frame.pack(pady=5)

        cancel_button = ctk.CTkButton(
            button_frame,
            text="İptal",
            command=on_close,
            fg_color="#666666",
            hover_color="#555555",
            text_color="white",
            width=100
        )
        cancel_button.pack(side="left", padx=10)

    def open_layer_name_dialog(self):
        """Open a dialog to add new layers with modern dark theme"""
        # Color palette
        COLOR_PALETTE = {
            "dark_bg": "#1a1a1a",
            "card_bg": "#2d2d2d",
            "accent": "#7B68EE",  # Modern mor renk
            "accent_light": "#9370DB",
            "text_main": "#ffffff",
            "text_secondary": "#b3b3b3",
            "input_bg": "#363636",
            "border": "#404040",
            "hover": "#3d3d3d"
        }

        # Create dialog window
        dialog = ctk.CTkToplevel(self)
        dialog.title("Create New Layer")
        dialog.geometry("400x500")
        dialog.resizable(False, False)
        dialog.configure(fg_color=COLOR_PALETTE["dark_bg"])
        dialog.grab_set()
        
        # Make window appear on top temporarily
        dialog.attributes('-topmost', True)
        dialog.after(100, lambda: dialog.attributes('-topmost', False))

        # Main container frame with gradient effect
        main_frame = ctk.CTkFrame(dialog, corner_radius=16, fg_color=COLOR_PALETTE["card_bg"])
        main_frame.pack(expand=True, fill="both", padx=20, pady=20)

        # Header with icon
        header_frame = ctk.CTkFrame(main_frame, fg_color="transparent", height=60)
        header_frame.pack(fill="x", padx=20, pady=(20, 10))
        
        ctk.CTkLabel(
            header_frame,
            text="CREATE NEW LAYER",
            text_color=COLOR_PALETTE["accent"],
            font=ctk.CTkFont(size=20, weight="bold")
        ).pack(side="left", padx=(0, 10))

        # Divider
        ctk.CTkFrame(
            main_frame,
            height=2,
            fg_color=COLOR_PALETTE["border"]
        ).pack(fill="x", padx=20, pady=(0, 20))

        # Content container
        content_frame = ctk.CTkFrame(main_frame, fg_color="transparent")
        content_frame.pack(fill="both", expand=True, padx=20, pady=(0, 20))

        # Layer name section
        name_var = tk.StringVar()
        name_label = ctk.CTkLabel(
            content_frame,
            text="Layer Name",
            text_color=COLOR_PALETTE["text_secondary"],
            font=ctk.CTkFont(size=12, weight="bold")
        )
        name_label.pack(anchor="w", pady=(0, 5))

        name_entry = ctk.CTkEntry(
            content_frame,
            textvariable=name_var,
            fg_color=COLOR_PALETTE["input_bg"],
            text_color=COLOR_PALETTE["text_main"],
            border_color=COLOR_PALETTE["border"],
            border_width=1,
            corner_radius=8,
            placeholder_text=f"Layer {len(self.layers) + 1}",
            font=ctk.CTkFont(size=13),
            height=40
        )
        name_entry.pack(fill="x", pady=(0, 20))

        # Tick delay section
        temp_tick_var = tk.IntVar(value=self.tick_var.get())
        tick_label = ctk.CTkLabel(
            content_frame,
            text="Tick Delay",
            text_color=COLOR_PALETTE["text_secondary"],
            font=ctk.CTkFont(size=12, weight="bold")
        )
        tick_label.pack(anchor="w", pady=(0, 5))

        tick_entry = ctk.CTkEntry(
            content_frame,
            textvariable=temp_tick_var,
            fg_color=COLOR_PALETTE["input_bg"],
            text_color=COLOR_PALETTE["text_main"],
            border_color=COLOR_PALETTE["border"],
            border_width=1,
            corner_radius=8,
            font=ctk.CTkFont(size=12)
        )
        tick_entry.pack(fill="x", pady=(0, 20), padx=20)

        # Submit button
        def on_submit():
            """Handle layer creation with validation"""
            name = name_var.get().strip() or f"Layer {len(self.layers) + 1}"
            
            try:
                tick = int(temp_tick_var.get())
                if tick < 0:
                    raise ValueError("Tick delay must be positive")
                    
                # Create new layer with current settings
                layer = Layer(
                    name=name,
                    tick_start=tick,
                    tick_end=tick,
                    tick_delay=tick,
                    particle=self.particle_var.get(),
                    color=self.color_var.get(),
                )
                
                # Apply additional properties
                try:
                    layer.y_offset = float(self.yoffset_var.get())
                except ValueError:
                    layer.y_offset = 0.0
                    
                layer.alpha = self.alpha_var.get()
                layer.shape_size = self.shape_size_var.get()
                layer.repeat = self.repeat_var.get()

                # Add to layers and refresh UI
                self.layers.append(layer)
                self.current_layer = layer
                self.refresh_layer_cards()
                self.refresh_canvas()
                dialog.destroy()
                
            except ValueError as e:
                messagebox.showerror(
                    "Invalid Input",
                    f"Please enter valid values.\nError: {str(e)}",
                    parent=dialog
                )
                tick_entry.focus_set()

        submit_btn = ctk.CTkButton(
            main_frame,
            text="CREATE LAYER",
            command=on_submit,
            fg_color=COLOR_PALETTE["accent"],
            hover_color=COLOR_PALETTE["accent_light"],
            text_color="#ffffff",
            corner_radius=8,
            height=40,
            font=ctk.CTkFont(size=13, weight="bold")
        )
        submit_btn.pack(pady=(10, 5), padx=20, fill="x")

        # Set focus to name entry by default
        name_entry.focus_set()

        # Close handler
        def on_close():
            dialog.destroy()

        dialog.protocol("WM_DELETE_WINDOW", on_close)
    
    
    def set_tool(self, tool):
        if not self.current_layer:
            messagebox.showwarning("No Layer", "Please create a layer first.")
            return

        self.current_tool = tool


        self.canvas.unbind("<B1-Motion>")


        if tool == "eraser":
            self.canvas.bind("<B1-Motion>", self.on_eraser_drag)
        elif tool == "free":
            self.canvas.bind("<B1-Motion>", self.draw_free)

    def on_eraser_drag(self, event):
        if not self.current_layer:
            return

        eraser_radius = 10  
        silinecek = []

        for element in self.current_layer.elements:
            if hasattr(element, "canvas_id"):
                coords = self.canvas.coords(element.canvas_id)
                if len(coords) >= 4:
                    x = (coords[0] + coords[2]) / 2
                    y = (coords[1] + coords[3]) / 2
                    if abs(event.x - x) <= eraser_radius and abs(event.y - y) <= eraser_radius:
                        self.canvas.delete(element.canvas_id)
                        silinecek.append(element)

        for e in silinecek:
            self.current_layer.elements.remove(e)

    def draw_free(self, event):
        if self.current_tool == "free" and self.current_layer:
            width = self.canvas.winfo_width()
            height = self.canvas.winfo_height()
            center_x = width // 2
            center_y = height // 2

            xoff = (event.x - center_x) / 10
            zoff = (event.y - center_y) / 10
            size = 2 * self.canvas_scale
            element_id = self.canvas.create_oval(event.x-size, event.y-size, event.x+size, event.y+size, fill=self.color_var.get(), outline="")
            tick_start = self.current_layer.tick_start
            tick_end = self.current_layer.tick_end
            element = Element("free", (xoff, zoff), element_id, tick_start, tick_end)
            self.current_layer.elements.append(element)

            # Mirror mode handling
            if self.mirror_mode_var.get():
                if self.mirror_axis == "x":
                    mirror_x = width - event.x
                    mirror_xoff = (mirror_x - center_x) / 10
                    mirror_id = self.canvas.create_oval(mirror_x-size, event.y-size, mirror_x+size, event.y+size, fill=self.color_var.get(), outline="")
                    mirror_element = Element("free", (mirror_xoff, zoff), mirror_id, tick_start, tick_end)
                    self.current_layer.elements.append(mirror_element)
                else:
                    mirror_y = height - event.y
                    mirror_zoff = (mirror_y - center_y) / 10
                    mirror_id = self.canvas.create_oval(event.x-size, mirror_y-size, event.x+size, mirror_y+size, fill=self.color_var.get(), outline="")
                    mirror_element = Element("free", (xoff, mirror_zoff), mirror_id, tick_start, tick_end)
                    self.current_layer.elements.append(mirror_element)

            # Double mirror mode handling
            if self.double_mirror_mode_var.get():
                mirror_x = width - event.x
                mirror_y = height - event.y
                mirror_xoff = (mirror_x - center_x) / 10
                mirror_zoff = (mirror_y - center_y) / 10
                mirror_id = self.canvas.create_oval(mirror_x-size, mirror_y-size, mirror_x+size, mirror_y+size, fill=self.color_var.get(), outline="")
                mirror_element = Element("free", (mirror_xoff, mirror_zoff), mirror_id, tick_start, tick_end)
                self.current_layer.elements.append(mirror_element)

    def create_circle(self, cx, cy, r):
        try:
            count = int(self.count_var.get())
        except ValueError:
            count = 10
        width = self.canvas.winfo_width()
        height = self.canvas.winfo_height()
        center_x = width // 2
        center_y = height // 2
        tick_start = self.current_layer.tick_start
        tick_end = self.current_layer.tick_end
        r = r * self.canvas_scale
        for i in range(count):
            angle = math.radians(i * (360 / count))
            x = cx + r * math.cos(angle)
            y = cy + r * math.sin(angle)
            size = 2 * self.canvas_scale
            element_id = self.canvas.create_oval(x-size, y-size, x+size, y+size, fill=self.color_var.get())
            xoff = (x - center_x) / 10
            zoff = (y - center_y) / 10
            element = Element("circle", (xoff, zoff), element_id, tick_start, tick_end)
            self.current_layer.elements.append(element)
            if self.mirror_mode_var.get():
                if self.mirror_axis == "x":
                    mirror_x = width - x
                    mirror_xoff = (mirror_x - center_x) / 10
                    mirror_id = self.canvas.create_oval(mirror_x-size, y-size, mirror_x+size, y+size, fill=self.color_var.get())
                    mirror_element = Element("circle", (mirror_xoff, zoff), mirror_id, tick_start, tick_end)
                    self.current_layer.elements.append(mirror_element)
                else:
                    mirror_y = height - y
                    mirror_zoff = (mirror_y - center_y) / 10
                    mirror_id = self.canvas.create_oval(x-size, mirror_y-size, x+size, mirror_y+size, fill=self.color_var.get())
                    mirror_element = Element("circle", (xoff, mirror_zoff), mirror_id, tick_start, tick_end)
                    self.current_layer.elements.append(mirror_element)
            if self.double_mirror_mode_var.get():
                mirror_x = width - x
                mirror_y = height - y
                mirror_xoff = (mirror_x - center_x) / 10
                mirror_zoff = (mirror_y - center_y) / 10
                mirror_id = self.canvas.create_oval(mirror_x-size, mirror_y-size, mirror_x+size, mirror_y+size, fill=self.color_var.get())
                mirror_element = Element("circle", (mirror_xoff, mirror_zoff), mirror_id, tick_start, tick_end)
                self.current_layer.elements.append(mirror_element)

    def create_square(self, cx, cy, size):
        try:
            count = int(self.count_var.get())
        except ValueError:
            count = 10
        width = self.canvas.winfo_width()
        height = self.canvas.winfo_height()
        center_x = width // 2
        center_y = height // 2
        tick_start = self.current_layer.tick_start
        tick_end = self.current_layer.tick_end
        size = size * self.canvas_scale
        point_size = 2 * self.canvas_scale
        step = max(1, int(size // count))
        for dx in range(-int(size // 2), int(size // 2) + 1, step):
            for dy in [-int(size // 2), int(size // 2)]:
                x = cx + dx
                y = cy + dy
                element_id = self.canvas.create_oval(x-point_size, y-point_size, x+point_size, y+point_size, fill=self.color_var.get())
                xoff = (x - center_x) / 10
                zoff = (y - center_y) / 10
                element = Element("square", (xoff, zoff), element_id, tick_start, tick_end)
                self.current_layer.elements.append(element)
                if self.mirror_mode_var.get():
                    if self.mirror_axis == "x":
                        mirror_x = width - x
                        mirror_xoff = (mirror_x - center_x) / 10
                        mirror_id = self.canvas.create_oval(mirror_x-point_size, y-point_size, mirror_x+point_size, y+point_size, fill=self.color_var.get())
                        mirror_element = Element("square", (mirror_xoff, zoff), mirror_id, tick_start, tick_end)
                        self.current_layer.elements.append(mirror_element)
                    else:
                        mirror_y = height - y
                        mirror_zoff = (mirror_y - center_y) / 10
                        mirror_id = self.canvas.create_oval(x-point_size, mirror_y-point_size, x+point_size, mirror_y+point_size, fill=self.color_var.get())
                        mirror_element = Element("square", (xoff, mirror_zoff), mirror_id, tick_start, tick_end)
                        self.current_layer.elements.append(mirror_element)
                if self.double_mirror_mode_var.get():
                    mirror_x = width - x
                    mirror_y = height - y
                    mirror_xoff = (mirror_x - center_x) / 10
                    mirror_zoff = (mirror_y - center_y) / 10
                    mirror_id = self.canvas.create_oval(mirror_x-point_size, mirror_y-point_size, mirror_x+point_size, mirror_y+point_size, fill=self.color_var.get())
                    mirror_element = Element("square", (mirror_xoff, mirror_zoff), mirror_id, tick_start, tick_end)
                    self.current_layer.elements.append(mirror_element)
        for dy in range(-int(size // 2), int(size // 2) + 1, step):
            for dx in [-int(size // 2), int(size // 2)]:
                x = cx + dx
                y = cy + dy
                element_id = self.canvas.create_oval(x-point_size, y-point_size, x+point_size, y+point_size, fill=self.color_var.get())
                xoff = (x - center_x) / 10
                zoff = (y - center_y) / 10
                element = Element("square", (xoff, zoff), element_id, tick_start, tick_end)
                self.current_layer.elements.append(element)
                if self.mirror_mode_var.get():
                    if self.mirror_axis == "x":
                        mirror_x = width - x
                        mirror_xoff = (mirror_x - center_x) / 10
                        mirror_id = self.canvas.create_oval(mirror_x-point_size, y-point_size, mirror_x+point_size, y+point_size, fill=self.color_var.get())
                        mirror_element = Element("square", (mirror_xoff, zoff), mirror_id, tick_start, tick_end)
                        self.current_layer.elements.append(mirror_element)
                    else:
                        mirror_y = height - y
                        mirror_zoff = (mirror_y - center_y) / 10
                        mirror_id = self.canvas.create_oval(x-point_size, mirror_y-point_size, x+point_size, mirror_y+point_size, fill=self.color_var.get())
                        mirror_element = Element("square", (xoff, mirror_zoff), mirror_id, tick_start, tick_end)
                        self.current_layer.elements.append(mirror_element)
                if self.double_mirror_mode_var.get():
                    mirror_x = width - x
                    mirror_y = height - y
                    mirror_xoff = (mirror_x - center_x) / 10
                    mirror_zoff = (mirror_y - center_y) / 10
                    mirror_id = self.canvas.create_oval(mirror_x-point_size, mirror_y-point_size, mirror_x+point_size, mirror_y+point_size, fill=self.color_var.get())
                    mirror_element = Element("square", (mirror_xoff, mirror_zoff), mirror_id, tick_start, tick_end)
                    self.current_layer.elements.append(mirror_element)

    def create_line(self, x1, y1, x2, y2):
        try:
            count = int(self.count_var.get())
        except ValueError:
            count = 10
        width = self.canvas.winfo_width()
        height = self.canvas.winfo_height()
        center_x = width // 2
        center_y = height // 2
        tick_start = self.current_layer.tick_start
        tick_end = self.current_layer.tick_end
        point_size = 2 * self.canvas_scale
        for i in range(count):
            t = i / count
            x = x1 + (x2 - x1) * t
            y = y1 + (y2 - y1) * t
            element_id = self.canvas.create_oval(x-point_size, y-point_size, x+point_size, y+point_size, fill=self.color_var.get())
            xoff = (x - center_x) / 10
            zoff = (y - center_y) / 10
            element = Element("line", (xoff, zoff), element_id, tick_start, tick_end)
            self.current_layer.elements.append(element)
            if self.mirror_mode_var.get():
                if self.mirror_axis == "x":
                    mirror_x = width - x
                    mirror_xoff = (mirror_x - center_x) / 10
                    mirror_id = self.canvas.create_oval(mirror_x-point_size, y-point_size, mirror_x+point_size, y+point_size, fill=self.color_var.get())
                    mirror_element = Element("line", (mirror_xoff, zoff), mirror_id, tick_start, tick_end)
                    self.current_layer.elements.append(mirror_element)
                else:
                    mirror_y = height - y
                    mirror_zoff = (mirror_y - center_y) / 10
                    mirror_id = self.canvas.create_oval(x-point_size, mirror_y-point_size, x+point_size, mirror_y+point_size, fill=self.color_var.get())
                    mirror_element = Element("line", (xoff, mirror_zoff), mirror_id, tick_start, tick_end)
                    self.current_layer.elements.append(mirror_element)
            if self.double_mirror_mode_var.get():
                mirror_x = width - x
                mirror_y = height - y
                mirror_xoff = (mirror_x - center_x) / 10
                mirror_zoff = (mirror_y - center_y) / 10
                mirror_id = self.canvas.create_oval(mirror_x-point_size, mirror_y-point_size, mirror_x+point_size, mirror_y+point_size, fill=self.color_var.get())
                mirror_element = Element("line", (mirror_xoff, mirror_zoff), mirror_id, tick_start, tick_end)
                self.current_layer.elements.append(mirror_element)

    def tool_click(self, event):
        if self.current_tool in ["circle", "square", "line"] and self.current_layer:
            self.shape_center_x = event.x
            self.shape_center_y = event.y

            size = self.shape_size_var.get()  

            if self.current_tool == "circle":
                self.create_circle(event.x, event.y, size // 2)  
            elif self.current_tool == "square":
                self.create_square(event.x, event.y, size)
            elif self.current_tool == "line":
                self.create_line(event.x, event.y, event.x + size, event.y)  


    def refresh_layer_cards(self):
        # Önce tüm eski kartları kaldır
        for widget in self.layer_cards_container.winfo_children():
            widget.destroy()

        if not self.layers:
            self.layer_cards_container.pack_forget()
            self.current_layer = None
            return
        else:
            # Sadece ilk defa pack çağır veya zaten packed ise atla
            if not self.layer_cards_container.winfo_ismapped():
                self.layer_cards_container.pack(anchor="n", fill="x", padx=6, pady=4)

        # Katmanları sırayla ekle
        for idx, layer in enumerate(self.layers):
            card = ctk.CTkFrame(self.layer_cards_container, fg_color="#232323", corner_radius=8)
            card.pack(fill="x", padx=0, pady=2)

            # Seçili katman kartına border ver
            if self.current_layer == layer:
                card.configure(border_width=2, border_color="#121212")
            else:
                card.configure(border_width=0)

            label = ctk.CTkLabel(
                card,
                text=f"{layer.name}           ⚚  Particle: {layer.particle}  ⚚  Delay: {layer.tick_delay}  ⚚  Color:{layer.color} ⚚" ,
                font=ctk.CTkFont(size=13, weight="bold"),
                text_color=self.text_color
            )
            label.pack(side="left", padx=(8, 4), pady=4)

            card.bind("<Button-1>", lambda e, i=idx: self.select_layer_card(i))
            label.bind("<Button-1>", lambda e, i=idx: self.select_layer_card(i))

    def select_layer_card(self, index):
        if 0 <= index < len(self.layers):
            self.current_layer = self.layers[index]
            self.refresh_layer_cards()
            self.refresh_canvas()
            
            # Layer ayarlarını güncelle
            if hasattr(self, 'variables'):
                self.variables['alpha'].set(str(self.current_layer.alpha))
                self.variables['repeat'].set(str(self.current_layer.repeat))
                self.variables['color'].set(self.current_layer.color)
                self.variables['y_offset'].set(str(self.current_layer.y_offset))
                self.variables['repeat_interval'].set(str(self.current_layer.repeat_interval))
                
                # Targeter ayarlarını güncelle
                if hasattr(self, 'targeter_var'):
                    self.targeter_var.set(self.current_layer.targeter.split('{')[0] if '{' in self.current_layer.targeter else self.current_layer.targeter)
                    
                # Targeter parametrelerini güncelle
                if hasattr(self, '_update_targeter_param_fields'):
                    self._update_targeter_param_fields(self.targeter_var.get())



    def show_code_and_close(self):
        if hasattr(self, 'current_layer'):
            try:
                self.current_layer.alpha = float(self.alpha_var.get())
            except ValueError:
                self.current_layer.alpha = 1.0

            try:
                self.current_layer.repeat = int(self.repeat_var.get())
            except ValueError:
                self.current_layer.repeat = 1

            try:
                self.current_layer.y_offset = float(self.yoffset_var.get())
            except ValueError:
                self.current_layer.y_offset = 0.0

            try:
                self.current_layer.repeat_interval = int(self.repeat_interval_var.get())
            except ValueError:
                self.current_layer.repeat_interval = 1

            self.current_layer.color = self.color_var.get()
            self.current_layer.targeter = self.targeter_var.get()

            if self.targeter_params:
                params_str = ";".join(f"{k}={v.get()}" for k, v in self.targeter_params.items())
                if params_str:
                    base_targeter = self.current_layer.targeter.split("{")[0]
                    self.current_layer.targeter = f"{base_targeter}{{{params_str}}}"

        # Kod üret
        self.generate_code()

        # Pencereyi kapat
        if hasattr(self, "element_window") and self.element_window is not None and self.element_window.winfo_exists():
            self.element_window.destroy()
            self.element_window = None


    def save_fxgen_file(self, auto=False):
        print("[DEBUG] save_fxgen_file çağrıldı")
        if auto:

            autosave_dir = os.path.join(os.path.expanduser("~"), "autosave")
            os.makedirs(autosave_dir, exist_ok=True)
            path = os.path.join(autosave_dir, "autosave.fxgen")
        else:
            path = filedialog.asksaveasfilename(defaultextension=".fxgen", filetypes=[("FXGEN Dosyası", "*.fxgen")])
            if not path:
                return

        data = {
            "layers": []
        }

        for layer in self.layers:
            layer_data = {
                "name": layer.name,
                "particle": layer.particle,
                "tick_delay": layer.tick_delay,
                "tick_start": layer.tick_start,
                "tick_end": layer.tick_end,
                "color": layer.color,
                "alpha": layer.alpha,
                "shape_size": layer.shape_size,
                "repeat": layer.repeat,
                "y_offset": layer.y_offset,
                "elements": []
            }

            for el in layer.elements:
                el_data = {
                    "typ": el.typ,
                    "position": el.position,
                    "tick_start": el.tick_start,
                    "tick_end": el.tick_end,
                    "y_offset": el.y_offset
                }
                layer_data["elements"].append(el_data)

            data["layers"].append(layer_data)

        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=4)

        if auto:
            print(f"[Otomatik Kayıt] Kaydedildi: {path}")
        else:
            print(f"Kaydedildi: {path}")

    def save_state_to_history(self):
        state = copy.deepcopy(self.layers)

        self.history = self.history[:self.history_index+1]
        self.history.append(state)
        self.history_index += 1


    def apply_rise_effect(self):
        """Apply the rising effect to all elements"""
        if not self.rise_mode.get():
            return  # Mode is disabled

        try:
            rise_speed = float(self.rise_speed_var.get())
            rise_limit = float(self.rise_limit_var.get())
            
            if rise_speed <= 0 or rise_limit <= 0:
                return
                
            elements_updated = 0
            
            for layer in self.layers:
                for element in layer.elements:
                    if element.y_offset < rise_limit:
                        # Calculate new position
                        new_offset = element.y_offset + rise_speed
                        element.y_offset = min(new_offset, rise_limit)
                        
                        # Update canvas position if exists
                        if hasattr(element, "canvas_id") and element.canvas_id:
                            self.canvas.move(element.canvas_id, 0, -rise_speed)
                            elements_updated += 1
            
            # Only refresh if we actually moved elements
            if elements_updated > 0:
                self.refresh_canvas()
                
            # Schedule next update (adjust timing as needed)
            self.after(50, self.apply_rise_effect)
            
        except (ValueError, AttributeError) as e:
            print(f"[Rise Effect Error] {str(e)}")
            self.rise_mode.set(False)  # Disable mode on error

    def load_fxgen_data(self, path):
        if not path:
            return

        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)

        self.layers.clear()
        self.clear_canvas()
        self.save_state_to_history()

        for layer_data in data["layers"]:
            new_layer = Layer(name=layer_data["name"])
            new_layer.particle = layer_data.get("particle", "reddust")
            new_layer.tick_delay = layer_data.get("tick_delay", 0)
            new_layer.tick_start = layer_data.get("tick_start", 0)
            new_layer.tick_end = layer_data.get("tick_end", 20)
            new_layer.color = layer_data.get("color", "#ffffff")
            new_layer.alpha = layer_data.get("alpha", 1)
            new_layer.shape_size = layer_data.get("shape_size", 1)
            new_layer.repeat = layer_data.get("repeat", 1)
            new_layer.y_offset = layer_data.get("y_offset", 0.0)

            for el_data in layer_data["elements"]:
                el = Element(
                    typ=el_data.get("typ", "point"),
                    position=tuple(el_data["position"]),
                    canvas_id=None,
                    tick_start=el_data.get("tick_start", 0),
                    tick_end=el_data.get("tick_end", 20),
                    y_offset=el_data.get("y_offset", 0.0)
                )
                new_layer.elements.append(el)

            self.layers.append(new_layer)

        self.refresh_layer_cards()
        self.current_layer = self.layers[0] if self.layers else None
        self.update_layer_selection()
        self.refresh_canvas()

    def load_fxgen_file(self):
        path = filedialog.askopenfilename(filetypes=[("FXGEN Dosyası", "*.fxgen")])
        if path:
            self.load_fxgen_data(path)
            self.current_layer = self.layers[0] if self.layers else None
            self.refresh_canvas()  

    def load_obj_file(self):
        if not self.current_layer:
            messagebox.showwarning("No Layer", "Please create a layer first.")
            return

        path = filedialog.askopenfilename(filetypes=[("OBJ Files", "*.obj")])
        if path:
            scale = self.obj_scale_var.get()


            performance = self.performance_mode.get()


            import_obj_to_layer(path, self.current_layer, self.canvas, scale, performance_mode=performance)


            selected_layer_name = self.current_layer.name


            self.show_all_layers()

            for index, layer in enumerate(self.layers):
                if layer.name == selected_layer_name:
                    self.current_layer = layer
                    break
            self.show_all_layers()
            self.refresh_layer_cards()  # Layer kartlarını yenile
            self.update_layer_selection()  # Eğer seçimi güncelleyen fonksiyon varsa onu çağır
            self.refresh_canvas()  # Canvas'ı yenile
            self.save_state_to_history()  # Geçmişe kaydet


    def load_image_and_convert(self):
        if not self.current_layer:
            messagebox.showwarning("No Layer", "Please create a layer first.")
            return
        filepath = filedialog.askopenfilename(filetypes=[("PNG files", "*.png")])
        if not filepath:
            return

        loading_win = ctk.CTkToplevel(self)
        loading_win.title("Loading Image")
        loading_win.geometry("400x150")
        loading_win.resizable(False, False)
        loading_win.grab_set()

        ctk.CTkLabel(loading_win, text="Loading image, please wait...", font=("Arial", 14)).pack(pady=10)

        progress_var = tk.DoubleVar(value=0)
        progress_bar = ctk.CTkProgressBar(loading_win, variable=progress_var, width=300)
        progress_bar.pack(pady=20)
        progress_bar.set(0)

        percent_label = ctk.CTkLabel(loading_win, text="0%")
        percent_label.pack()

        img = Image.open(filepath).convert("RGBA")

        try:
            resize_val = int(self.resize_var.get())
        except (ValueError, AttributeError):
            resize_val = 20

        if self.performance_mode.get():
            resize_val = max(4, resize_val // 2)

        img = img.resize((resize_val, resize_val))
        self.tk_img = ImageTk.PhotoImage(img)

        pixels = img.load()
        pixel_coords = []

        step = 2
        width, height = img.width, img.height

        coords_to_process = []
        for y in range(0, height, step):
            for x in range(0, width, step):
                r, g, b, a = pixels[x, y]
                if self.performance_mode.get() and a < 100:
                    continue
                elif not self.performance_mode.get() and a <= 0:
                    continue
                coords_to_process.append((x, y, r, g, b, a))

        total_pixels = len(coords_to_process)

        center_x = self.canvas.winfo_width() // 2
        center_y = self.canvas.winfo_height() // 2

        use_real_color = getattr(self, "image_color_mode", ctk.BooleanVar(value=False)).get()

        self.current_layer.elements.clear()  # Önceki elemanları temizle

        size = 4
        chunk_size = 100  # Bir seferde kaç piksel çizilecek
        current_index = 0

        def draw_chunk():
            nonlocal current_index
            end_index = min(current_index + chunk_size, total_pixels)

            for i in range(current_index, end_index):
                x, y, r, g, b, a = coords_to_process[i]

                cx = x - width // 2 + center_x
                cy = y - height // 2 + center_y
                color_hex = f"#{r:02x}{g:02x}{b:02x}"

                fill_color = color_hex if use_real_color else "#000000"

                element_id = self.canvas.create_oval(cx, cy, cx + size, cy + size, fill=fill_color, outline="")
                xoff = (x - width // 2) / 10
                zoff = (y - height // 2) / 10

                element_color = color_hex if use_real_color else "#000000"
                element = Element(
                    "image",
                    (xoff, zoff),
                    element_id,
                    self.current_layer.tick_start,
                    self.current_layer.tick_end,
                    color=element_color
                )
                self.current_layer.add_element(element)
            current_index = end_index

            progress = (current_index / total_pixels) * 100
            progress_var.set(progress)
            percent_label.configure(text=f"{int(progress)}%")

            if current_index < total_pixels:
                self.canvas.after(10, draw_chunk)  # 10 ms sonra devam et
            else:
                loading_win.destroy()
                self.refresh_canvas()

        draw_chunk()




    def draw_points_in_chunks(self, pixel_coords, chunk_size=100):
        if not pixel_coords:
            return

        chunk = pixel_coords[:chunk_size]
        for cx, cy, color_hex, x, y in chunk:
            element_id = self.canvas.create_oval(cx, cy, cx + 1, cy + 1, fill=color_hex, outline="")
            xoff = (x - self.tk_img.width() // 2) / 10
            zoff = (y - self.tk_img.height() // 2) / 10
            element = Element("image", (xoff, zoff), element_id, self.current_layer.tick_start, self.current_layer.tick_end)
            self.current_layer.add_element(element)

        self.refresh_canvas()
        self.canvas.after(1, lambda: self.draw_points_in_chunks(pixel_coords[chunk_size:], chunk_size))

    def clear_canvas(self):
        # current_layer layers listesinde yoksa None yap veya uygun bir layer seç
        if self.current_layer not in self.layers:
            if self.layers:
                self.current_layer = self.layers[0]
            else:
                self.current_layer = None

        if self.current_layer is not None:
            self.current_layer.elements.clear()
            idx = self.layers.index(self.current_layer)
            self.refresh_layer_cards()
            self.select_layer_card(idx)
        else:
            # Layer yoksa, sadece katman kartlarını yenile
            self.refresh_layer_cards()

        self.refresh_canvas()
        self.save_state_to_history()
        
    def optimize_output_lines(self, lines):
        optimized = []
        last = ""
        count = 0

        for line in lines:
            if line == last:
                count += 1
            else:
                if count > 0:
                    optimized.append(self._apply_repeat(last, count))
                last = line
                count = 1

        if count > 0:
            optimized.append(self._apply_repeat(last, count))

        return optimized

    def _apply_repeat(self, line, count):
        if count == 1:
            return line


        if "effect:particles{" in line:
            match = re.search(r"repeat=(\d+)", line)
            if match:
                original_repeat = int(match.group(1))
                new_repeat = original_repeat * count
                return re.sub(r"repeat=\d+", f"repeat={new_repeat}", line)
            else:
                return line 


        return line  

        self.refresh_canvas()
    def toggle_mirror_mode(self):
        self.mirror_mode_var.set(not self.mirror_mode_var.get())
        self.double_mirror_mode_var.set(False)
        self.refresh_canvas()

    def toggle_double_mirror_mode(self):
        self.double_mirror_mode_var.set(not self.double_mirror_mode_var.get())
        self.mirror_mode_var.set(False)
        self.refresh_canvas()



    def get_rainbow_color(hue):
        r, g, b = colorsys.hsv_to_rgb(hue, 1, 1)
        # RGB değerlerini 0-255 aralığına çevir, sonra hex yap
        r = int(r * 255)
        g = int(g * 255)
        b = int(b * 255)
        return f"{r},{g},{b}"

    def generate_code(self):
        loading_window = ctk.CTkToplevel(self)
        loading_window.title("Generating Code")
        loading_window.geometry("400x150")
        loading_window.resizable(False, False)
        loading_window.grab_set()

        ctk.CTkLabel(loading_window, text="Generating code, please wait...", font=("Arial", 14)).pack(pady=10)

        progress_var = tk.DoubleVar(value=0)
        progress_bar = ctk.CTkProgressBar(loading_window, variable=progress_var, width=300)
        progress_bar.pack(pady=20)
        progress_bar.set(0)

        total_elements = sum(len(layer.elements) for layer in self.layers)
        processed_elements = 0

        def safe_update_progress(value):
            if loading_window.winfo_exists():
                loading_window.after(0, lambda: progress_var.set(value))
                loading_window.after(0, progress_bar.update_idletasks)

        def safe_insert_line(line):
            self.output_box.after(0, lambda: self.output_box.insert("end", line + "\n"))

        def get_rainbow_color(hue):
            r, g, b = colorsys.hsv_to_rgb(hue, 1, 1)
            return "#{:02x}{:02x}{:02x}".format(int(r*255), int(g*255), int(b*255))

        def generate_effect_line(effect_type, p, c, a, repeat, interval, x, z, y, targeter_str):
            if effect_type == "particles":
                return (
                    f"  - effect:particles{{p={p};c={c};a={a};size=1;repeat={repeat};"
                    f"repeatInterval={interval}}} @{targeter_str}{{xoffset={x:.4f};zoffset={z:.4f};yoffset={y:.4f}}}"
                )
            else:
                return (
                    f"  - summonareaeffectcloud{{particle={p};d=100;r=1;color={c}}} "
                    f"@{targeter_str}{{xoffset={x:.4f};zoffset={z:.4f};yoffset={y:.4f}}}"
                )
        def generate():
            nonlocal processed_elements
            try:
                self.output_box.after(0, lambda: self.output_box.delete("1.0", "end"))
                skill_name = self.skill_name_var.get().strip() or "MySkill"
                effect_type = self.effect_type.get()
                proximity = self.proximity_mode.get()
                rotate = self.rotate_mode.get()
                persistent = self.persistent_mode.get()
                performance = self.performance_mode.get()
                rise_mode_active = self.rise_mode.get()
                rise_speed = self.rise_speed_var.get()
                rise_limit = self.rise_limit_var.get()
                local_rotate_active = self.local_rotate_mode.get()
                local_radius = float(self.local_rotate_radius.get()) if local_rotate_active else 0.4
                local_speed = float(self.local_rotate_speed.get()) if local_rotate_active else 1.0

                step = int(self.sequential_step_var.get()) if proximity else 0
                delay_ticks = int(self.delay_var.get()) if proximity else 0

                try:
                    global_y_offset = float(self.yoffset_var.get())
                except Exception:
                    global_y_offset = 0.0

                output_lines = [f"{skill_name}:", "  Skills:"]
                effect_count = 0

                hue = 0.0

                for layer in sorted(self.layers, key=lambda l: l.tick_start):
                    if not layer.elements:
                        continue
                    targeter = getattr(layer, "targeter", "Origin")  # default Origin
                    output_lines.append(f"  # {layer.name}")

                    p = layer.particle
                    c = layer.color
                    a = layer.alpha
                    s = layer.shape_size
                    repeat = layer.repeat
                    repeat_interval = layer.repeat_interval
                    y_offset_layer = layer.y_offset + global_y_offset

                    targeter = getattr(layer, "targeter", None)
                    targeter_str = targeter if targeter else "Origin"

                    elements = layer.elements.copy()

                    if rotate:
                        rotate_speed_val = max(1, self.rotate_speed.get())
                        num_frames = max(10, int(120 - rotate_speed_val * 1.1))
                        angle_step = (2 * math.pi) / num_frames
                        current_y_offset = 0

                        delay_time = 10 - (rotate_speed_val - 1) * (4 / 99)
                        delay_time = max(1, min(10, delay_time))

                        for tick in range(num_frames):
                            angle = tick * angle_step
                            output_lines.append(f"  - delay {delay_time:.2f}")

                            for element in layer.elements:
                                x, z = element.position
                                y = element.y_offset + y_offset_layer + current_y_offset

                                # Global rotasyon (origin etrafında)
                                x_rot = x * math.cos(angle) - z * math.sin(angle)
                                z_rot = x * math.sin(angle) + z * math.cos(angle)

                                current_color = getattr(element, "color", c)
                                if self.rainbow_mode.get():
                                    current_color = get_rainbow_color(hue)
                                    hue = (hue + 0.02) % 1.0

                                if effect_type == "particles":
                                    line = (
                                        f"  - effect:particles{{p={p};c={current_color};a={a};size=1;repeat={repeat};"
                                        f"repeatInterval={repeat_interval}}} "
                                        f"@{targeter_str}{{xoffset={x_rot:.4f};zoffset={z_rot:.4f};yoffset={y:.4f}}}"
                                    )
                                else:
                                    line = (
                                        f"  - summonareaeffectcloud{{particle={p};d=100;r=1;color={current_color}}} "
                                        f"@{targeter_str}{{xoffset={x_rot:.4f};zoffset={z_rot:.4f};yoffset={y:.4f}}}"
                                    )
                                output_lines.append(line)

                            if rise_mode_active:
                                current_y_offset += rise_speed
                                if current_y_offset > rise_limit:
                                    current_y_offset = rise_limit

                    elif local_rotate_active:
                        rotate_speed_val = max(1, local_speed)
                        num_frames = max(10, int(120 - rotate_speed_val * 1.1))

                        delay_time = 10 - (rotate_speed_val - 1) * (4 / 99)
                        delay_time = max(1, min(10, delay_time))

                        for tick in range(num_frames):
                            output_lines.append(f"  - delay {delay_time:.2f}")

                            local_angle = tick * math.radians(local_speed)
                            lx = local_radius * math.cos(local_angle)
                            lz = local_radius * math.sin(local_angle)

                            for element in layer.elements:
                                x, z = element.position
                                y = element.y_offset + y_offset_layer

                                # Local rotasyon (kendi etrafında)
                                x_rot = x + lx
                                z_rot = z + lz

                                current_color = getattr(element, "color", c)
                                if self.rainbow_mode.get():
                                    current_color = get_rainbow_color(hue)
                                    hue = (hue + 0.02) % 1.0

                                if effect_type == "particles":
                                    line = (
                                        f"  - effect:particles{{p={p};c={current_color};a={a};size=1;repeat={repeat};"
                                        f"repeatInterval={repeat_interval}}} "
                                        f"@{targeter_str}{{xoffset={x_rot:.4f};zoffset={z_rot:.4f};yoffset={y:.4f}}}"
                                    )
                                else:
                                    line = (
                                        f"  - summonareaeffectcloud{{particle={p};d=100;r=1;color={current_color}}} "
                                        f"@{targeter_str}{{xoffset={x_rot:.4f};zoffset={z_rot:.4f};yoffset={y:.4f}}}"
                                    )
                                output_lines.append(line)

                    elif rise_mode_active:
                        rise_loop_count = int(rise_limit / rise_speed)
                        for rise_index in range(rise_loop_count):
                            output_lines.append(f"  - delay 3")
                            for element in elements:
                                x, z = element.position
                                y = rise_index * rise_speed  # <-- SADECE BU KULLANILMALI

                                current_color = getattr(element, "color", c)
                                if self.rainbow_mode.get():
                                    current_color = get_rainbow_color(hue)
                                    hue = (hue + 0.02) % 1.0

                                line = generate_effect_line(effect_type, p, current_color, a, repeat, repeat_interval, x, z, y, targeter_str)
                                output_lines.append(line)

                    elif proximity:
                        def dist(a, b):
                            dx = a.position[0] - b.position[0]
                            dz = a.position[1] - b.position[1]
                            return dx * dx + dz * dz

                        ordered = []
                        current = elements.pop(0)
                        ordered.append(current)
                        while elements:
                            next_elem = min(elements, key=lambda e: dist(current, e))
                            elements.remove(next_elem)
                            ordered.append(next_elem)
                            current = next_elem

                        for i, element in enumerate(ordered):
                            x, z = element.position
                            y = element.y_offset + y_offset_layer

                            current_color = getattr(element, "color", c)
                            if self.rainbow_mode.get():
                                current_color = get_rainbow_color(hue)
                                hue = (hue + 0.02) % 1.0

                            line = generate_effect_line(effect_type, p, current_color, a, repeat, 1, x, z, y, targeter_str)
                            output_lines.append(line)
                            effect_count += 1
                            if step > 0 and delay_ticks > 0 and effect_count % step == 0:
                                output_lines.append(f"  - delay {delay_ticks}")

                    elif persistent:
                        for element in elements:
                            x, z = element.position
                            y = element.y_offset + y_offset_layer

                            current_color = getattr(element, "color", c)
                            if self.rainbow_mode.get():
                                current_color = get_rainbow_color(hue)
                                hue = (hue + 0.02) % 1.0

                            line = (
                                f"  - summonareaeffectcloud{{particle={p};d=200;r=1;color={current_color}}} "
                                f"@{targeter_str}{{xoffset={x:.4f};zoffset={z:.4f};yoffset={y:.4f}}}"
                            )
                            output_lines.append(line)

                    else:
                        output_lines.append(f"  - delay {layer.tick_start}")
                        for element in elements:
                            x, z = element.position
                            y = element.y_offset + y_offset_layer

                            current_color = getattr(element, "color", c)
                            if self.rainbow_mode.get():
                                current_color = get_rainbow_color(hue)
                                hue = (hue + 0.02) % 1.0

                            line = generate_effect_line(effect_type, p, current_color, a, repeat, repeat_interval, x, z, y, targeter_str)
                            output_lines.append(line)

                    processed_elements += len(layer.elements)
                    safe_update_progress(processed_elements / total_elements)

                if performance:
                    output_lines = self.optimize_output_lines(output_lines)

                total_lines = len(output_lines)
                for idx, line in enumerate(output_lines):
                    safe_insert_line(line)
                    if idx % 100 == 0 or idx == total_lines - 1:
                        safe_update_progress((idx + 1) / total_lines)

            finally:
                if loading_window.winfo_exists():
                    loading_window.after(0, loading_window.destroy)

        threading.Thread(target=generate, daemon=True).start()



    def save_code(self):
        self.generate_code()
        code_text = self.output_box.get("1.0", "end")
        filename = filedialog.asksaveasfilename(defaultextension=".txt", filetypes=[("Text Files", "*.txt")])
        if filename:
            with open(filename, "w") as file:
                file.write(code_text)

    def add_layer(self, auto=False):
        if auto:
            layer_name = "Layer 1"
            tick_start = 0  
        else:

            self.open_layer_name_dialog()
            return  


        try:
            tick_start = int(self.delay_var.get())
        except:
            tick_start = 0  

        new_layer = Layer(layer_name, tick_start=tick_start)
        self.layers.append(new_layer)
        self.save_state_to_history()
        self.current_layer = new_layer
        self.refresh_layer_cards()

    def delete_layer(self):
        if not self.current_layer:
            return
        idx = self.layers.index(self.current_layer)
        deleted_layer = self.layers.pop(idx)
        for element in deleted_layer.elements:
            if hasattr(element, "canvas_id") and element.canvas_id:
                self.canvas.delete(element.canvas_id)
        if self.layers:
            self.current_layer = self.layers[0]
            self.update_layer_selection()
            self.refresh_canvas()
        else:
            self.current_layer = None
            self.canvas.delete("all")
        self.save_state_to_history()
        self.refresh_layer_cards()

    def pick_color(self):
        color_picker = AskColor(initial_color=self.color_var.get())
        color_picker.grab_set()
        color_picker.wait_window()
        chosen_color = color_picker._color
        if chosen_color:
            self.color_var.set(chosen_color)
            current_layer = self.get_current_layer()
            if current_layer:
                current_layer.color = chosen_color
                for elem in current_layer.elements:
                    elem.color = chosen_color
                print(f"[SYNC] Layer {current_layer.name} ve element renkleri güncellendi: {chosen_color}")

                self.refresh_canvas()
                self.refresh_layer_cards()  # Burada layer kartlarını yenile





    def rename_layer(self):
        if not self.current_layer:
            return
        new_name = simpledialog.askstring("Rename Layer", "Enter new layer name:", initialvalue=self.current_layer.name)
        if new_name:
            self.current_layer.name = new_name
            self.refresh_layer_cards()
            self.update_layer_selection()

    def select_layer(self, layer_index):
        if 0 <= layer_index < len(self.layers):
            self.current_layer = self.layers[layer_index]
            self.refresh_canvas()
            self.refresh_layer_cards()
    def get_current_layer(self):
        # Mevcut aktif layer'ı döndürür
        return self.current_layer
    
    def update_target_image(self):
        self.refresh_canvas()


    def refresh_canvas(self):
            self.canvas.delete("all")
            width = self.canvas.winfo_width()
            height = self.canvas.winfo_height()

            if width < 50 or height < 50:
                self.after(100, self.refresh_canvas)
                return

            center_x = width // 2
            center_y = height // 2

            # Ortaya bir + işareti çiz
            cross_size = 9999999  # Uzunluk (istediğin gibi ayarlayabilirsin)
            cross_color = "#000000"  # Renk (istediğin gibi ayarlayabilirsin)
            self.canvas.create_line(center_x - cross_size, center_y, center_x + cross_size, center_y, fill=cross_color, width=2)
            self.canvas.create_line(center_x, center_y - cross_size, center_x, center_y + cross_size, fill=cross_color, width=2)

            # self.canvas.create_image(center_x, center_y, image=self.target_photo, anchor='center', tags="center_target")  # KALDIRILDI

            performance_mode = self.performance_mode.get()

            if len(self.layers) == 1:
                layers_to_draw = [self.layers[0]]
                self.current_layer = self.layers[0]
            elif self.current_layer:
                layers_to_draw = [self.current_layer]
            else:
                layers_to_draw = [layer for layer in self.layers if layer.visible]

            for layer in layers_to_draw:
                elements = layer.elements[::4] if performance_mode else layer.elements
                for element in elements:
                    xoff, zoff = element.position
                    x = center_x + xoff * 10
                    y = center_y + zoff * 10

                    if hasattr(element, "color"):
                        fill_color = element.color
                    else:
                        fill_color = getattr(layer, "color", "#ffffff")

                    canvas_id = self.canvas.create_oval(x, y, x + 2, y + 2, fill=fill_color, outline="")
                    element.canvas_id = canvas_id



    def update_current_layer(self, attr, value):
        if self.current_layer:
            setattr(self.current_layer, attr, value)
            print(f"[SYNC] {self.current_layer.name} için {attr} güncellendi: {value}")


    def update_target_position(self, event=None):
        self.canvas.delete("center_target")
        w = self.canvas.winfo_width()
        h = self.canvas.winfo_height()
        img_w, img_h = self.target_image.size
        # Resmi tam ortala, 1-2 px kaymayı önlemek için konumu resmin yarısı kadar kaydır
        x = int(w / 2)
        y = int(h / 2)
        self.canvas.create_image(x, y, image=self.target_photo, anchor='center', tags="center_target")

    def update_layer_selection(self):
        if not self.current_layer:
            return

        if hasattr(self, 'tick_start_var'):
            self.tick_start_var.set(self.current_layer.tick_start)
        if hasattr(self, 'tick_end_var'):
            self.tick_end_var.set(self.current_layer.tick_end)
        if hasattr(self, 'delay_var'):
            self.delay_var.set(str(self.current_layer.tick_delay))

        particle = self.current_layer.particle if self.current_layer.particle else "Not Selected"
        if hasattr(self, 'particle_name_button'):
            self.particle_name_button.configure(text=f"Partikül: {particle}")
        if hasattr(self, 'particle_var'):
            self.particle_var.set(particle)

        if hasattr(self, "alpha_var"):
            self.alpha_var.set(getattr(self.current_layer, "alpha", 1))
        if hasattr(self, "shape_size_var"):
            self.shape_size_var.set(getattr(self.current_layer, "shape_size", 1))
        if hasattr(self, "repeat_var"):
            self.repeat_var.set(getattr(self.current_layer, "repeat", 1))
        if hasattr(self, "color_var"):
            self.color_var.set(self.current_layer.color)
        if hasattr(self, "yoffset_var"):
            self.yoffset_var.set(getattr(self.current_layer, "y_offset", 0.0))

    def update_tick_values(self):
        if self.current_layer:
            self.current_layer.tick_start = self.tick_start_var.get()
            self.current_layer.tick_end = self.tick_end_var.get()
            self.current_layer.tick_delay = self.delay_var.get()

    def move_layer_up(self):
        if not self.current_layer:
            return
        idx = self.layers.index(self.current_layer)
        if idx > 0:
            self.layers[idx], self.layers[idx - 1] = self.layers[idx - 1], self.layers[idx]
            self.current_layer = self.layers[idx - 1]
            self.refresh_layer_cards()
            self.update_layer_selection()

    def move_layer_down(self):
        if not self.current_layer:
            return
        idx = self.layers.index(self.current_layer)
        if idx < len(self.layers) - 1:
            self.layers[idx], self.layers[idx + 1] = self.layers[idx + 1], self.layers[idx]
            self.current_layer = self.layers[idx + 1]
            self.refresh_layer_cards()
            self.update_layer_selection()

    def handle_mause_press(self, event):
        if self.current_tool != "free":
            self.tool_click(event)
            return

        if not self.current_layer:
            return

        clicked_items = self.canvas.find_overlapping(event.x, event.y, event.x, event.y)
        for item in clicked_items:
            for element in self.current_layer.elements:
                if element.id == item and element.type == "free":
                    self.selected_element = element
                    self.drag_data["x"] = event.x
                    self.drag_data["y"] = event.y
                    return

    def on_item_drag(self, event):
        if self.selected_element:
            dx = event.x - self.drag_data["x"]
            dy = event.y - self.drag_data["y"]
            self.canvas.move(self.selected_element.id, dx, dy)


            old_x, old_z = self.selected_element.position
            new_x = (old_x * 10 + 375) + dx
            new_y = (old_z * 10 + 275) + dy
            new_xoff = (new_x - 375) / 10
            new_zoff = (new_y - 275) / 10
            self.selected_element.position = (new_xoff, new_zoff)

            self.drag_data["x"] = event.x
            self.drag_data["y"] = event.y

    def on_item_release(self, event):
        self.selected_element = None

    def update_active_modes_display(self):
        modes = {
            "Rotate Mode": self.rotate_mode.get(),
            "Rise Mode": self.rise_mode.get(),
            "Persistent Effect Mode": self.persistent_mode.get(),
            "Proximity Mode": self.proximity_mode.get(),
            "Performance Mode": self.performance_mode.get(),
            "Rainbow Mode": self.rainbow_mode.get(),
            "Image Color Mode": self.image_color_mode.get(),
            "Local Rotate Mode": self.local_rotate_mode.get(),
            
        }

        active_modes = [mode for mode, active in modes.items() if active]

        if active_modes:
            self.active_modes_label.configure(text="Active modes: " + ", ".join(active_modes))
        else:
            self.active_modes_label.configure(text="No active modes")

    def open_element_settings(self):
        # Pencere kontrolü ve oluşturma
        if self.element_window is not None and self.element_window.winfo_exists():
            self.element_window.destroy()

        self.element_window = ctk.CTkToplevel(self)
        self.element_window.title("Element Settings")
        self.element_window.geometry("800x700")
        self.element_window.resizable(False, False)
        self.element_window.transient(self)
        self.element_window.grab_set()

        def on_close():
            self.element_window.destroy()
            self.element_window = None

        self.element_window.protocol("WM_DELETE_WINDOW", on_close)

        container = ctk.CTkFrame(self.element_window, fg_color="transparent")
        container.pack(fill="both", expand=True, padx=20, pady=20)

        # Başlık
        title = ctk.CTkLabel(container, text="ELEMENT SETTINGS",
                           font=ctk.CTkFont(size=20, weight="bold"),
                           text_color="#e0e0e0")
        title.grid(row=0, column=0, columnspan=5, pady=(0, 20), sticky="w")

        # Layer seçimi
        layer_label = ctk.CTkLabel(container, text="SELECT LAYER",
                                 font=ctk.CTkFont(size=12, weight="bold"),
                                 text_color="#a0a0a0")
        layer_label.grid(row=1, column=0, columnspan=5, pady=(0, 5), sticky="w")

        layer_names = [f"Layer {i+1}" for i in range(len(self.layers))]
        layer_var = ctk.StringVar(value=layer_names[0] if layer_names else "")
        layer_menu = ctk.CTkOptionMenu(container, values=layer_names,
                                     variable=layer_var,
                                     command=self._on_layer_selected,
                                     width=400, height=38,
                                     fg_color="#3a3a3a",
                                     button_color="#121212",
                                     button_hover_color="#522a2a",
                                     dropdown_fg_color="#3a3a3a",
                                     dropdown_text_color="#e0e0e0",
                                     corner_radius=8,
                                     font=ctk.CTkFont(size=12))
        layer_menu.grid(row=2, column=0, columnspan=5, pady=(0, 20), sticky="w")

        # Aktif Modlar Gösterge Alanı
        active_modes_frame = ctk.CTkFrame(
            container,
            fg_color="#121212",
            corner_radius=8,
            border_width=1,
            border_color="#2a2a2a"
        )
        active_modes_frame.grid(row=3, column=0, columnspan=5, pady=(0, 15), sticky="ew")

        ctk.CTkLabel(
            active_modes_frame,
            text="ACTIVE MODES:",
            font=ctk.CTkFont(size=12, weight="bold"),
            text_color="#ffffff"
        ).pack(side="left", padx=10, pady=5)

        self.active_modes_label = ctk.CTkLabel(
            active_modes_frame,
            text="",
            font=ctk.CTkFont(size=12),
            text_color="#e0e0e0",
            wraplength=500,
            justify="left"
        )
        self.active_modes_label.pack(side="left", fill="x", expand=True, padx=(0, 10), pady=5)

        # Değişkenler
        labels = ["ALPHA", "REPEAT", "COLOR", "Y OFFSET", "REPEAT INTERVAL"]
        self.variables = {
            'alpha': ctk.StringVar(),
            'repeat': ctk.StringVar(),
            'color': ctk.StringVar(),
            'y_offset': ctk.StringVar(),
            'repeat_interval': ctk.StringVar()
        }

        # Değişken değişikliklerini dinle
        def on_variable_change(*args, var_name=None):
            if hasattr(self, 'current_layer') and self.current_layer:
                try:
                    if var_name == 'alpha':
                        self.current_layer.alpha = float(self.variables[var_name].get())
                    elif var_name == 'repeat':
                        self.current_layer.repeat = int(self.variables[var_name].get())
                    elif var_name == 'color':
                        self.current_layer.color = self.variables[var_name].get()
                    elif var_name == 'y_offset':
                        self.current_layer.y_offset = float(self.variables[var_name].get())
                    elif var_name == 'repeat_interval':
                        self.current_layer.repeat_interval = int(self.variables[var_name].get())
                except (ValueError, TypeError):
                    pass  # Geçersiz değer girildiğinde sessizce devam et

        # Her değişken için trace ekle
        for var_name in self.variables:
            self.variables[var_name].trace_add("write", lambda *args, var_name=var_name: on_variable_change(var_name=var_name))

        # Mevcut katmanın ayarlarını yükle
        self._load_current_layer_settings()

        for i in range(5):
            container.grid_columnconfigure(i, weight=1, uniform="col")

        for i, (label_text, var_name) in enumerate(zip(labels, ['alpha', 'repeat', 'color', 'y_offset', 'repeat_interval'])):
            label = ctk.CTkLabel(container, text=label_text, 
                            font=ctk.CTkFont(size=12, weight="bold"), 
                            text_color="#a0a0a0")
            label.grid(row=4, column=i, padx=8, pady=(0, 5), sticky="w")

            entry = ctk.CTkEntry(container, textvariable=self.variables[var_name], height=34, 
                                fg_color="#2e2e2e", border_width=0,
                                corner_radius=8, text_color="#e0e0e0")
            entry.grid(row=5, column=i, padx=8, pady=(0, 15), sticky="ew")

        # Targeter bölümü
        separator = ctk.CTkFrame(container, height=2, fg_color="#4a4a4a")
        separator.grid(row=6, column=0, columnspan=5, sticky="ew", pady=10, padx=10)

        targeter_label = ctk.CTkLabel(container, text="TARGETER CONFIGURATION",
                                    font=ctk.CTkFont(size=12, weight="bold"),
                                    text_color="#7e7e7e")
        targeter_label.grid(row=7, column=0, columnspan=5, pady=(0, 10), sticky="w", padx=10)

        if not hasattr(self, 'user_targeters'):
            self.user_targeters = ["@Origin"]

        self.targeter_var = ctk.StringVar()
        self.targeter_params = {}
        self.targeter_param_entries = {}

        # Targeter dropdown
        self.targeter_menu = ctk.CTkOptionMenu(
            container,
            values=self.user_targeters,
            variable=self.targeter_var,
            command=self._update_targeter_param_fields,
            width=400,
            height=38,
            fg_color="#3a3a3a",
            button_color="#121212",
            button_hover_color="#522a2a",
            dropdown_fg_color="#3a3a3a",
            dropdown_text_color="#e0e0e0",
            corner_radius=8,
            font=ctk.CTkFont(size=12)
        )
        self.targeter_menu.grid(row=8, column=0, columnspan=4, padx=10, pady=(0, 10), sticky="ew")

        # Targeter listesi
        self.list_frame = ctk.CTkScrollableFrame(container, height=120, 
                                        fg_color="#2e2e2e", 
                                        corner_radius=8,
                                        border_width=1,
                                        border_color="#4a4a4a")
        self.list_frame.grid(row=9, column=0, rowspan=3, columnspan=4, 
                    sticky="nsew", pady=(0, 10), padx=10)
        self.list_frame.grid_columnconfigure(0, weight=1)

        self.targeter_labels = []

        self._refresh_targeter_list()

        # Butonlar
        btn_frame = ctk.CTkFrame(container, fg_color="transparent")
        btn_frame.grid(row=9, column=4, rowspan=2, padx=5, pady=5, sticky="ns")
        
        btn_add = ctk.CTkButton(btn_frame, text="+", command=self._add_targeter,
                            width=36, height=36, corner_radius=10,
                            fg_color="#121212", hover_color="#522a2a",
                            font=ctk.CTkFont(size=16, weight="bold"))
        btn_add.pack(pady=(0, 5))

        btn_remove = ctk.CTkButton(btn_frame, text="-", command=self._remove_targeter,
                                width=36, height=36, corner_radius=10,
                                fg_color="#121212", hover_color="#522a2a",
                                font=ctk.CTkFont(size=16, weight="bold"))
        btn_remove.pack()

        # Alt butonlar
        btn_container = ctk.CTkFrame(container, fg_color="transparent")
        btn_container.grid(row=12, column=0, columnspan=5, pady=(10, 15), sticky="ew")
        btn_container.grid_columnconfigure(0, weight=1)
        btn_container.grid_columnconfigure(1, weight=1)

        close_btn = ctk.CTkButton(
            btn_container,
            text="CLOSE",
            command=on_close,
            fg_color="#121212",
            hover_color="#522a2a",
            height=40,
            corner_radius=10,
            font=ctk.CTkFont(size=13, weight="bold"),
            text_color="#e0e0e0"
        )
        close_btn.grid(row=0, column=0, padx=(20, 10), sticky="ew")

        show_code_btn = ctk.CTkButton(
            btn_container,
            text="SHOW CODE",
            command=self._generate_and_show_code,
            fg_color="#121212",
            hover_color="#522a2a",
            height=40,
            corner_radius=10,
            font=ctk.CTkFont(size=13, weight="bold"),
            text_color="#e0e0e0"
        )
        show_code_btn.grid(row=0, column=1, padx=(10, 20), sticky="ew")

        # Başlangıçta mevcut katmanın ayarlarını yükle
        self._update_targeter_param_fields(self.targeter_var.get())

    def _on_layer_selected(self, choice):
        """Katman değiştiğinde çağrılır"""
        layer_index = int(choice.split()[-1]) - 1
        self.current_layer = self.layers[layer_index]
        self._load_current_layer_settings()

    def _load_current_layer_settings(self):
        """Seçili katmanın ayarlarını yükler"""
        if hasattr(self, 'current_layer'):
            layer = self.current_layer
            self.variables['alpha'].set(str(layer.alpha))
            self.variables['repeat'].set(str(layer.repeat))
            self.variables['color'].set(layer.color)
            self.variables['y_offset'].set(str(layer.y_offset))
            self.variables['repeat_interval'].set(str(layer.repeat_interval))
            
            # Targeter ayarlarını yükle
            if hasattr(layer, 'targeter'):
                self.targeter_var.set(layer.targeter.split('{')[0] if '{' in layer.targeter else layer.targeter)
            else:
                self.targeter_var.set("@Origin")
            
            self._update_active_modes_display()

    def _update_active_modes_display(self):
        """Açık olan modları günceller"""
        if hasattr(self.current_layer, 'modes'):
            active_modes = [mode for mode, active in self.current_layer.modes.items() if active]
            if active_modes:
                self.active_modes_label.configure(text=", ".join(active_modes))
            else:
                self.active_modes_label.configure(text="No active modes")
        else:
            self.active_modes_label.configure(text="No mode information")

    def _update_targeter_param_fields(self, choice):
        """Targeter parametre alanlarını günceller"""
        for entry in self.targeter_param_entries.values():
            entry.destroy()
        self.targeter_param_entries.clear()

        if hasattr(self, 'current_layer'):
            self.current_layer.targeter = choice

        if "{" in choice and "}" in choice:
            raw_params = choice.split("{")[1].replace("}", "")
            param_list = raw_params.split(";")

            for i, pair in enumerate(param_list):
                if "=" in pair:
                    key, value = pair.split("=")
                    self.targeter_params[key] = ctk.StringVar(value=value)

                    lbl = ctk.CTkLabel(self.container, text=key, 
                                    text_color="#a0a0a0", 
                                    font=ctk.CTkFont(size=11))
                    lbl.grid(row=9, column=i, padx=6, pady=(0, 4), sticky="w")

                    entry = ctk.CTkEntry(self.container, textvariable=self.targeter_params[key],
                                    width=100, height=30, 
                                    fg_color="#2e2e2e", border_width=0,
                                    corner_radius=8, text_color="#e0e0e0")
                    entry.grid(row=10, column=i, padx=6, pady=(0, 15), sticky="ew")
                    self.targeter_param_entries[key] = entry

    def _refresh_targeter_list(self):
        """Targeter listesini yeniler"""
        for lbl in self.targeter_labels:
            lbl.destroy()
        self.targeter_labels.clear()

        for idx, t in enumerate(self.user_targeters):
            lbl = ctk.CTkLabel(self.list_frame, text=t, 
                            text_color="#e0e0e0", 
                            anchor="w", 
                            font=ctk.CTkFont(size=12),
                            padx=10)
            lbl.grid(row=idx, column=0, sticky="ew", padx=0, pady=2)
            self.targeter_labels.append(lbl)

    def _add_targeter(self):
        """Yeni targeter ekler"""
        new_t = simpledialog.askstring("Add Targeter", "Enter new targeter:",
                                    parent=self.element_window)
        if new_t and new_t.strip():
            self.user_targeters.append(new_t.strip())
            self._refresh_targeter_list()
            self.targeter_menu.configure(values=self.user_targeters)

    def _remove_targeter(self):
        """Targeter siler"""
        if self.user_targeters:
            removed = self.user_targeters.pop()
            self._refresh_targeter_list()
            self.targeter_menu.configure(values=self.user_targeters)

    def _generate_and_show_code(self):
        """Kodu oluşturur ve gösterir"""
        if hasattr(self, 'current_layer'):
            # Tüm ayarları kaydet
            try:
                self.current_layer.alpha = float(self.variables['alpha'].get())
                self.current_layer.repeat = int(self.variables['repeat'].get())
                self.current_layer.color = self.variables['color'].get()
                self.current_layer.y_offset = float(self.variables['y_offset'].get())
                self.current_layer.repeat_interval = int(self.variables['repeat_interval'].get())
                
                self.current_layer.targeter = self.targeter_var.get()
                if self.targeter_params:
                    params_str = ";".join(f"{k}={v.get()}" for k, v in self.targeter_params.items())
                    if params_str:
                        base_targeter = self.current_layer.targeter.split("{")[0]
                        self.current_layer.targeter = f"{base_targeter}{{{params_str}}}"
            except (ValueError, TypeError) as e:
                print(f"Error converting values: {e}")
                return

        self.generate_code()
        self.element_window.destroy()
        self.element_window = None



    def _update_active_modes_display(self):
        """Açık olan modları günceller"""
        if hasattr(self.current_layer, 'modes'):
            active_modes = [mode for mode, active in self.current_layer.modes.items() if active]
            if active_modes:
                self.active_modes_label.configure(text=", ".join(active_modes))
            else:
                self.active_modes_label.configure(text="No active modes")
        else:
            self.active_modes_label.configure(text="No mode information")

    def _update_targeter_param_fields(self, choice):
        """Targeter parametre alanlarını günceller"""
        for entry in self.targeter_param_entries.values():
            entry.destroy()
        self.targeter_param_entries.clear()

        if hasattr(self, 'current_layer'):
            self.current_layer.targeter = choice

        if "{" in choice and "}" in choice:
            raw_params = choice.split("{")[1].replace("}", "")
            param_list = raw_params.split(";")

            for i, pair in enumerate(param_list):
                if "=" in pair:
                    key, value = pair.split("=")
                    self.targeter_params[key] = ctk.StringVar(value=value)

                    lbl = ctk.CTkLabel(self.container, text=key, 
                                    text_color="#a0a0a0", 
                                    font=ctk.CTkFont(size=11))
                    lbl.grid(row=9, column=i, padx=6, pady=(0, 4), sticky="w")

                    entry = ctk.CTkEntry(self.container, textvariable=self.targeter_params[key],
                                    width=100, height=30, 
                                    fg_color="#2e2e2e", border_width=0,
                                    corner_radius=8, text_color="#e0e0e0")
                    entry.grid(row=10, column=i, padx=6, pady=(0, 15), sticky="ew")
                    self.targeter_param_entries[key] = entry

    def _refresh_targeter_list(self):
        """Targeter listesini yeniler"""
        for lbl in self.targeter_labels:
            lbl.destroy()
        self.targeter_labels.clear()

        for idx, t in enumerate(self.user_targeters):
            lbl = ctk.CTkLabel(self.list_frame, text=t, 
                            text_color="#e0e0e0", 
                            anchor="w", 
                            font=ctk.CTkFont(size=12),
                            padx=10)
            lbl.grid(row=idx, column=0, sticky="ew", padx=0, pady=2)
            self.targeter_labels.append(lbl)

    def _add_targeter(self):
        """Yeni targeter ekler"""
        new_t = simpledialog.askstring("Add Targeter", "Enter new targeter:",
                                    parent=self.element_window)
        if new_t and new_t.strip():
            self.user_targeters.append(new_t.strip())
            self._refresh_targeter_list()
            self.targeter_menu.configure(values=self.user_targeters)

    def _remove_targeter(self):
        """Targeter siler"""
        if self.user_targeters:
            removed = self.user_targeters.pop()
            self._refresh_targeter_list()
            self.targeter_menu.configure(values=self.user_targeters)

    def _generate_and_show_code(self):
        """Kodu oluşturur ve gösterir"""
        if hasattr(self, 'current_layer'):
            # Tüm ayarları kaydet
            try:
                self.current_layer.alpha = float(self.variables['alpha'].get())
                self.current_layer.repeat = int(self.variables['repeat'].get())
                self.current_layer.color = self.variables['color'].get()
                self.current_layer.y_offset = float(self.variables['y_offset'].get())
                self.current_layer.repeat_interval = int(self.variables['repeat_interval'].get())
                
                self.current_layer.targeter = self.targeter_var.get()
                if self.targeter_params:
                    params_str = ";".join(f"{k}={v.get()}" for k, v in self.targeter_params.items())
                    if params_str:
                        base_targeter = self.current_layer.targeter.split("{")[0]
                        self.current_layer.targeter = f"{base_targeter}{{{params_str}}}"
            except (ValueError, TypeError) as e:
                print(f"Error converting values: {e}")
                return

        self.generate_code()
        self.element_window.destroy()
        self.element_window = None
 
    def show_all_layers(self):
        for layer in self.layers:
            layer.visible = True

        if len(self.layers) == 1:
            self.current_layer = self.layers[0]
        else:
            self.current_layer = None  # Burayı None yap ki tüm katmanlar çizilsin

        self.refresh_canvas()
        
    def hex_to_rgb(hex_color):
        hex_color = hex_color.lstrip("#")
        # 6 haneli hex için her iki karakteri al, 16 tabanında int yap
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))

    def export_and_show_vtk(self):
    # 1. Export verilerini hazırla (örnek)
        export_data = []
        for layer in self.layers:
            for element in layer.elements:
                export_data.append({
                    "x": element.position[0],
                    "y": getattr(element, "y_offset", 0),
                    "z": element.position[1],
                    "color": getattr(element, "color", "#121212")
                })

        # 2. VTK preview objesi oluştur
        self.vtk_preview = VTKPreview(export_data, rotate=True)  # rotate veya rise parametresini istediğin gibi ayarla

        # 3. Animasyonu başlat
        self.vtk_preview.start_animation()

def hex_to_rgb(hex_color):
    hex_color = hex_color.lstrip("#")
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
class VTKPreview:
    def __init__(self, points_data, rotate=False, rise=False, local_rotate=False, local_radius=0.4, local_speed=1.0):
        self.rotate = rotate
        self.rise = rise
        self.points_data = points_data
        self.local_rotate = local_rotate
        self.local_radius = local_radius
        self.local_speed = local_speed


        self.points = vtk.vtkPoints()
        self.vertices = vtk.vtkCellArray()
        self.colors = vtk.vtkUnsignedCharArray()
        self.colors.SetNumberOfComponents(3)

        for i, d in enumerate(points_data):
            self.points.InsertNextPoint(d["x"], d["y"], d["z"])
            self.vertices.InsertNextCell(1)
            self.vertices.InsertCellPoint(i)
            r, g, b = hex_to_rgb(d.get("color", "#ffffff"))
            self.colors.InsertNextTuple3(r, g, b)

        self.polydata = vtk.vtkPolyData()
        self.polydata.SetPoints(self.points)
        self.polydata.SetVerts(self.vertices)
        self.polydata.GetPointData().SetScalars(self.colors)

        self.mapper = vtk.vtkPolyDataMapper()
        self.mapper.SetInputData(self.polydata)

        self.actor = vtk.vtkActor()
        self.actor.SetMapper(self.mapper)
        self.actor.GetProperty().SetPointSize(12)

        self.renderer = vtk.vtkRenderer()
        self.renderer.AddActor(self.actor)
        self.renderer.SetBackground(0.16, 0.16, 0.16)

        self.render_window = vtk.vtkRenderWindow()
        self.render_window.SetWindowName("3D Preview")
        self.render_window.SetSize(960, 720)
        self.render_window.AddRenderer(self.renderer)

        self.interactor = vtk.vtkRenderWindowInteractor()
        style = vtk.vtkInteractorStyleTrackballCamera()
        self.interactor.SetInteractorStyle(style)
        self.interactor.SetRenderWindow(self.render_window)

        self.original_points = [list(self.points.GetPoint(i)) for i in range(self.points.GetNumberOfPoints())]
        self.current_y_offsets = [p[1] for p in self.original_points]
        self.timer_count = 0
        self.timer_id = None
        self.animating = False

    def timer_callback(self, obj, event):
        if not self.animating:
            return
        angle_rad = math.radians(self.timer_count % 360)

        if self.rotate:
            for i, (x0, y0, z0) in enumerate(self.original_points):
                new_x = x0 * math.cos(angle_rad) - z0 * math.sin(angle_rad)
                new_z = x0 * math.sin(angle_rad) + z0 * math.cos(angle_rad)
                self.points.SetPoint(i, new_x, y0, new_z)
        elif self.rise:
            for i, (x0, y0, z0) in enumerate(self.original_points):
                new_y = self.current_y_offsets[i] + 0.05
                if new_y > 5:
                    new_y = 0
                self.current_y_offsets[i] = new_y
                self.points.SetPoint(i, x0, new_y, z0)

        self.points.Modified()
        self.render_window.Render()
        self.timer_count += 1

    def start_animation(self):
        if not self.animating:
            self.animating = True
            self.timer_id = self.interactor.CreateRepeatingTimer(30)
            self.interactor.AddObserver("TimerEvent", self.timer_callback)
            self.interactor.Initialize()
            self.interactor.Start()

    def stop_animation(self):
        if self.animating:
            self.animating = False
            if self.timer_id:
                self.interactor.DestroyTimer(self.timer_id)

    def show(self):
        self.render_window.Render()
        self.interactor.Initialize()
        self.interactor.Start()

def open_preview():
    points_data = [
        {"x": 0, "y": 0, "z": 0, "color": "#ff0000"},
        {"x": 1, "y": 0, "z": 0, "color": "#00ff00"},
        {"x": 0, "y": 0, "z": 1, "color": "#0000ff"},
    ]

    preview = VTKPreview(points_data, rotate=True)
    preview.start_animation()

def import_obj_to_layer(obj_path, target_layer, canvas, scale=1.0, performance_mode=False):
    try:
        loading_win = ctk.CTkToplevel(canvas.master)
        loading_win.title("Loading OBJ")
        loading_win.geometry("400x150")
        loading_win.resizable(False, False)
        loading_win.grab_set()

        ctk.CTkLabel(loading_win, text="Loading OBJ, please wait...", font=("Arial", 14)).pack(pady=10)

        progress_var = tk.DoubleVar(value=0)
        progress_bar = ctk.CTkProgressBar(loading_win, variable=progress_var, width=300)
        progress_bar.pack(pady=20)

        percent_label = ctk.CTkLabel(loading_win, text="0%")
        percent_label.pack()

        canvas.update_idletasks()
        canvas_width = canvas.winfo_width()
        canvas_height = canvas.winfo_height()

        vertices = []
        with open(obj_path, 'r') as f:
            for line in f:
                if line.startswith("v "):
                    parts = line.strip().split()
                    if len(parts) >= 4:
                        x_blender, y_blender, z_blender = map(float, parts[1:4])
                        x = x_blender * scale
                        z = y_blender * scale
                        y = -z_blender * scale
                        vertices.append((x, y, z)) 

        if performance_mode:
            vertices = vertices[::4]  

        total = len(vertices)
        is_loading = True  # pencere açık mı kontrol flagi

        def on_close():
            nonlocal is_loading
            is_loading = False
            loading_win.destroy()

        loading_win.protocol("WM_DELETE_WINDOW", on_close)

        def draw_chunk(index=0, chunk_size=100):
            nonlocal total, is_loading
            if not is_loading:
                # Pencere kapandı, işlem iptal
                return

            for i in range(index, min(index + chunk_size, total)):
                x, y, z = vertices[i]
                canvas_x = canvas_width / 2 + x
                canvas_y = canvas_height / 2 + y

                item = canvas.create_oval(canvas_x - 2, canvas_y - 2, canvas_x + 2, canvas_y + 2,
                                          fill=getattr(target_layer, "color", "white"))
                element = Element("obj", (x, y), item, tick_start=target_layer.tick_start, tick_end=target_layer.tick_end, y_offset=z)
                element.y = z
                target_layer.add_element(element)

            progress = (min(index + chunk_size, total) / total) * 100
            progress_var.set(progress)
            percent_label.configure(text=f"{int(progress)}%")

            if index + chunk_size < total:
                canvas.after(10, lambda: draw_chunk(index + chunk_size, chunk_size))
            else:
                is_loading = False
                loading_win.destroy()
                print(f"{total} vertex başarıyla eklendi.")

        draw_chunk()

    except Exception as e:
        print("OBJ import hatası:", e)



class ModernParticleBackground(ctk.CTkCanvas):
    def __init__(self, master, width, height):
        super().__init__(master, width=width, height=height, highlightthickness=0)
        self.pack(fill="both", expand=True)
        
        # Temel grafiksel özellikler
        self.width = width
        self.height = height
        self.bg_base_color = "#121212"  # Çok koyu gri, neredeyse siyah
        self.configure(bg=self.bg_base_color)
        
        # Parçacık sistemi
        self.particles = []
        self.particle_colors = ["#FF3C5F", "#FF5E3A", "#FF2D55", "#8A2BE2", "#5E17EB", "#4B0082"]  # Kırmızı-mor tonları
        self.particle_count = 80
        
        # Bağlantı çizgileri için parametreler
        self.connection_distance = 150
        self.connection_opacity_factor = 0.6
        
        # 3D derinlik efekti için z-koordinat
        self.depth_range = (-100, 100)
        
        # Parçacıkları başlat
        self.create_particles()
        self.animate()
        
        # Hafif ışık efekti için radial gradient overlay
        self.create_gradient_overlay()
        
    def create_gradient_overlay(self):
        # Ekranın ortasına doğru hafif aydınlık efekti
        self.create_oval(
            self.width/2 - 300, 
            self.height/2 - 300, 
            self.width/2 + 300, 
            self.height/2 + 300, 
            fill="", 
            outline="", 
            stipple="gray12", 
            tags=("overlay",)
        )
        
    def create_particles(self):
        for _ in range(self.particle_count):
            x = random.randint(0, self.width)
            y = random.randint(0, self.height)
            z = random.randint(*self.depth_range)  # 3D derinlik
            
            size = random.randint(3, 8)
            # Z değerine göre boyut ayarlaması (derinlik hissi için)
            size = size * (1 + (z - self.depth_range[0]) / (self.depth_range[1] - self.depth_range[0]) * 0.5)
            
            speed_x = random.uniform(-0.5, 0.5)
            speed_y = random.uniform(-0.5, 0.5)
            speed_z = random.uniform(-0.2, 0.2)  # Z ekseni hızı
            
            color = random.choice(self.particle_colors)
            
            pulse_speed = random.uniform(0.02, 0.05)
            pulse_factor = random.uniform(0, math.pi*2)
            
            self.particles.append({
                "x": x, "y": y, "z": z,
                "size": size, "base_size": size,
                "speed_x": speed_x, "speed_y": speed_y, "speed_z": speed_z,
                "color": color,
                "pulse_speed": pulse_speed,
                "pulse_factor": pulse_factor
            })
    
    def animate(self):
        self.delete("particle", "connection")
        
        # Parçacıkları güncelleştir ve çiz
        for p in self.particles:
            # Hareket
            p["x"] += p["speed_x"]
            p["y"] += p["speed_y"] 
            p["z"] += p["speed_z"]
            
            # Pulsation - boyut animasyonu
            pulse = math.sin(p["pulse_factor"]) * 0.3 + 0.7
            p["pulse_factor"] += p["pulse_speed"]
            current_size = p["base_size"] * pulse
            
            # Z konumuna göre ölçek ve alpha değeri ayarla
            z_scale = self.map_range(p["z"], self.depth_range[0], self.depth_range[1], 0.5, 1.5)
            z_alpha = self.map_range(p["z"], self.depth_range[0], self.depth_range[1], 30, 100)
            
            # Ekran sınırlarını kontrol et
            if p["x"] < -20 or p["x"] > self.width + 20:
                p["speed_x"] *= -1
            if p["y"] < -20 or p["y"] > self.height + 20:
                p["speed_y"] *= -1
            if p["z"] < self.depth_range[0] or p["z"] > self.depth_range[1]:
                p["speed_z"] *= -1
            
            # Alfa değeri için hex formatına dönüştür
            particle_color = p['color']
            
            # Parçacığı çiz
            size = current_size * z_scale
            self.create_oval(
                p["x"] - size/2, p["y"] - size/2,
                p["x"] + size/2, p["y"] + size/2,
                fill=particle_color, outline="", tags=("particle",)
            )
        
        # Parçacıklar arası bağlantıları çiz
        for i, p1 in enumerate(self.particles):
            for j, p2 in enumerate(self.particles[i+1:], i+1):
                # İki parçacık arasındaki mesafeyi hesapla
                dx = p1["x"] - p2["x"]
                dy = p1["y"] - p2["y"]
                dz = p1["z"] - p2["z"]  # 3D mesafe için
                distance = math.sqrt(dx*dx + dy*dy + dz*dz)
                
                # Belirli mesafe içindeyse bağlantı çizgisi oluştur
                if distance < self.connection_distance:
                    # Mesafeye göre saydamlık
                    opacity = 1 - (distance / self.connection_distance)
                    opacity *= self.connection_opacity_factor
                    
                    # Z konumlarının ortalamasına göre saydamlık ayarla
                    avg_z = (p1["z"] + p2["z"]) / 2
                    z_opacity = self.map_range(avg_z, self.depth_range[0], self.depth_range[1], 0.3, 1.0)
                    opacity *= z_opacity
                    
                    # Saydamlık değerini hex formatına dönüştür
                    # line_color = f"#FFFFFF{alpha_hex}"
                    line_color = "#FFFFFF"

                    
                    # Çizgi kalınlığını z konumuna göre ayarla
                    line_width = self.map_range(avg_z, self.depth_range[0], self.depth_range[1], 0.5, 1.5)
                    
                    self.create_line(
                        p1["x"], p1["y"], p2["x"], p2["y"],
                        fill=line_color, width=line_width, tags=("connection",)
                    )
        
        self.tag_lower("connection")  # Bağlantıları parçacıkların altına yerleştir
        self.tag_raise("overlay")  # Overlay'i en üste çıkar
        
        self.after(30, self.animate)
    
    def map_range(self, value, in_min, in_max, out_min, out_max):
        # Bir değeri bir aralıktan diğerine dönüştür
        return out_min + (value - in_min) * (out_max - out_min) / (in_max - in_min)


class ModernButton(ctk.CTkFrame):
    def __init__(self, master, text, icon_path, command, width=180, height=180, hover_effect=True):
        super().__init__(master, fg_color="transparent", corner_radius=15)

        self.command = command
        self.hover_effect = hover_effect
        self.active = False

        self.inner_frame = ctk.CTkFrame(
            self,
            width=width,
            height=height,
            corner_radius=15,
            fg_color="#1A1A1A",
            border_width=1,
            border_color="#333333"
        )
        self.inner_frame.pack(padx=0, pady=0)
        self.inner_frame.pack_propagate(False)

        # Glow canvas ilk oluşturuluyor ve yerleştiriliyor (arka planda)
        self.glow_canvas = ctk.CTkCanvas(
            self.inner_frame,
            width=width,
            height=height,
            highlightthickness=0,
            bg="#1A1A1A"
        )
        self.glow_canvas.place(x=0, y=0)

        self.glow_id = self.glow_canvas.create_oval(
            width/2-60, height/2-60, width/2+60, height/2+60,
            fill="#FF2D55", stipple="gray12", state="hidden"
        )

        # İkon ve metin label'ları en son oluşturuluyor (canvas'ın üstünde yerleşir)
        self.icon_image = ctk.CTkImage(Image.open(icon_path).convert("RGBA"), size=(64, 64))

        self.icon_label = ctk.CTkLabel(
            self.inner_frame,
            image=self.icon_image,
            text="",
            fg_color="transparent"
        )
        self.icon_label.place(relx=0.5, rely=0.38, anchor="center")

        self.text_label = ctk.CTkLabel(
            self.inner_frame,
            text=text,
            font=ctk.CTkFont(family="Segoe UI", size=16, weight="bold"),
            text_color="#FFFFFF"
        )
        self.text_label.place(relx=0.5, rely=0.75, anchor="center")

        # Hover efektleri
        if hover_effect:
            for widget in [self.inner_frame, self.icon_label, self.text_label]:
                widget.bind("<Enter>", self.on_enter)
                widget.bind("<Leave>", self.on_leave)
                widget.bind("<ButtonPress-1>", self.on_press)
                widget.bind("<ButtonRelease-1>", self.on_release)

    def on_enter(self, event):
        if not self.active:
            self.inner_frame.configure(fg_color="#252525")
            self.glow_canvas.configure(bg="#252525")

    def on_leave(self, event):
        if not self.active:
            self.inner_frame.configure(fg_color="#1A1A1A")
            self.glow_canvas.configure(bg="#1A1A1A")

    def on_press(self, event):
        self.inner_frame.configure(fg_color="#303030")
        self.glow_canvas.configure(bg="#303030")

    def on_release(self, event):
        self.inner_frame.configure(fg_color="#252525")
        self.glow_canvas.configure(bg="#252525")
        if self.command:
            self.command()

    def set_active(self, active=True):
        self.active = active
        if active:
            self.inner_frame.configure(fg_color="#303030")
            self.glow_canvas.configure(bg="#303030")
        else:
            self.inner_frame.configure(fg_color="#1A1A1A")
            self.glow_canvas.configure(bg="#1A1A1A")

class ModernHeaderBar(ctk.CTkFrame):
    def __init__(self, master, title="AuraFX", subtitle="Advanced Visual Effects Generator"):
        super().__init__(master, fg_color="#121212", height=80, corner_radius=0)
        
        # Logo (varsayılan simge)
        logo_path = os.path.join("assets", "title.png")
        if os.path.exists(logo_path):
            self.logo_image = ctk.CTkImage(Image.open(logo_path), size=(50, 50))
            self.logo_label = ctk.CTkLabel(self, image=self.logo_image, text="")
            self.logo_label.pack(side="left", padx=(20, 10), pady=15)
        
        # Başlık ve alt başlık için frame
        self.title_frame = ctk.CTkFrame(self, fg_color="transparent")
        self.title_frame.pack(side="left", fill="y")
        
        # Başlık
        self.title_label = ctk.CTkLabel(
            self.title_frame, 
            text=title, 
            font=ctk.CTkFont(family="Segoe UI", size=22, weight="bold"),
            text_color="#FFFFFF"
        )
        self.title_label.pack(side="top", anchor="w", padx=5, pady=(15, 0))
        
        # Alt başlık
        self.subtitle_label = ctk.CTkLabel(
            self.title_frame, 
            text=subtitle, 
            font=ctk.CTkFont(family="Segoe UI", size=12),
            text_color="#AAAAAA"
        )
        self.subtitle_label.pack(side="top", anchor="w", padx=5, pady=(0, 15))
        
        # Sağ taraf için sürüm bilgisi
        self.version_label = ctk.CTkLabel(
            self, 
            text= LOCAL_VERSION, 
            font=ctk.CTkFont(family="Segoe UI", size=12),
            text_color="#666666"
        )
        self.version_label.pack(side="right", padx=20)

class MainMenu(ctk.CTk):
    def __init__(self):
        super().__init__()

        ctk.set_appearance_mode("dark")
        ctk.set_default_color_theme("dark-blue")

        self.title("AuraFX - Next Generation Effect Generator")
        self.after(100, lambda: self.state('zoomed'))
        self.bind("<Escape>", lambda event: self.destroy())

        if getattr(sys, 'frozen', False):
            base_path = os.path.join(os.path.dirname(sys.executable), "assets", "icons")
        else:
            base_path = os.path.join(os.path.dirname(__file__), "assets", "icons")

        self.icon_paths = {
            "new": os.path.join(base_path, "add-post.png"),
            "open": os.path.join(base_path, "share.png"),
            "settings": os.path.join(base_path, "settings.png"),
            "logout": os.path.join(base_path, "logout.png"),
            "update": os.path.join(base_path, "update.png"),
            "effects": os.path.join(base_path, "add-post.png"),
        }

        self.bg = ModernParticleBackground(self, self.winfo_screenwidth(), self.winfo_screenheight())

        self.header = ModernHeaderBar(self)
        self.header.pack(side="top", fill="x", pady=0)

        # Container to hold title, tagline and buttons
        self.main_container = ctk.CTkFrame(self.bg, fg_color="transparent")
        self.main_container.place(relx=0.5, rely=0.5, anchor="center")

        # Title (logo)
        self.title_image = ctk.CTkImage(Image.open("assets/title.png"), size=(200, 200))
        self.title_label = ctk.CTkLabel(self.main_container, image=self.title_image, text="")
        self.title_label.pack(pady=(0, 10))

        # Tagline
        self.tagline_label = ctk.CTkLabel(
            self.main_container,
            text="Create Stunning Visual Effects with Ease",
            font=ctk.CTkFont(family="Segoe UI", size=18),
            text_color="#EEEEEE"
        )
        self.tagline_label.pack(pady=(0, 30))

        # Buttons container - yatay olarak butonlar burada olacak
        self.buttons_container = ctk.CTkFrame(self.main_container, fg_color="transparent")
        self.buttons_container.pack()

        self.create_menu_buttons()

        self.footer = ctk.CTkFrame(self.bg, fg_color="#121212", height=40, corner_radius=0)
        self.footer.pack(side="bottom", fill="x")

        self.status_label = ctk.CTkLabel(
            self.footer,
            text="Ready",
            font=ctk.CTkFont(family="Segoe UI", size=12),
            text_color="#AAAAAA"
        )
        self.status_label.pack(side="left", padx=20)

        self.info_label = ctk.CTkLabel(
            self.footer,
            text="© 2025 AuraFX",
            font=ctk.CTkFont(family="Segoe UI", size=12),
            text_color="#666666"
        )
        self.info_label.pack(side="right", padx=20)

    def create_menu_buttons(self):
        button_configs = [
            {
                "text": "Create New Effect",
                "icon": self.icon_paths["new"],
                "command": self.open_effect_editor
            },
            {
                "text": "Open Effect",
                "icon": self.icon_paths["open"],
                "command": self.open_and_load_fxgen
            },
            {
                "text": "Settings",
                "icon": self.icon_paths["settings"],
                "command": lambda: SettingsWindow(self)
            },
            {
                "text": "Exit",
                "icon": self.icon_paths["logout"],
                "command": self.quit_application
            }
        ]

        # Butonları yatay yan yana hizala
        for config in button_configs:
            btn = ModernButton(
                self.buttons_container,
                text=config["text"],
                icon_path=config["icon"],
                command=config["command"],
                width=160  # istersen buton genişliğini ayarlayabilirsin
            )
            btn.pack(side="left", padx=10, pady=5)

    def open_effect_editor(self):
        self.status_label.configure(text="Opening Effect Editor...")
        self.update()

        self.destroy()
        editor = EffectEditorApp()
        editor.mainloop()

    def open_and_load_fxgen(self):
        path = filedialog.askopenfilename(filetypes=[("FXGEN Dosyası", "*.fxgen")])
        if not path:
            return

        self.status_label.configure(text=f"Loading effect: {os.path.basename(path)}...")
        self.update()

        def open_and_load():
            editor = EffectEditorApp()
            editor.after(100, lambda: editor.load_fxgen_data(path))
            editor.mainloop()

        self.destroy()
        open_and_load()

    def quit_application(self):
        self.destroy()


class SettingsWindow(ctk.CTkToplevel):
    def __init__(self, master):
        super().__init__(master)
        self.title("Settings")
        self.geometry("500x600")
        self.resizable(False, False)
        self.grab_set()
        
        # Tema ve görünüm
        self.configure(fg_color="#121212")
        
        # Başlık
        self.header = ctk.CTkFrame(self, fg_color="#1A1A1A", corner_radius=0, height=60)
        self.header.pack(side="top", fill="x", pady=(0, 20))
        
        ctk.CTkLabel(
            self.header, 
            text="Settings", 
            font=ctk.CTkFont(family="Segoe UI", size=20, weight="bold")
        ).pack(side="left", padx=20, pady=15)
        
        # Ana içerik alanı - kaydırılabilir
        self.content = ctk.CTkScrollableFrame(self, fg_color="transparent")
        self.content.pack(fill="both", expand=True, padx=20, pady=0)
        
        # Ayarlar kategorileri
        self.create_section("General Settings", [
            self.create_autosave_setting,
        ])
        
        self.create_section("Performance Settings                                    coming soon", [
            self.create_quality_setting,
            self.create_cache_setting
        ])
        
        self.create_section("Interface Settings                                           coming soon", [
            self.create_animation_setting,
            self.create_accent_color_setting
        ])
        
        # Butonlar için alt panel
        self.button_frame = ctk.CTkFrame(self, fg_color="#1A1A1A", corner_radius=0, height=60)
        self.button_frame.pack(side="bottom", fill="x")
        
        # Kaydet butonu
        self.save_button = ctk.CTkButton(
            self.button_frame,
            text="Save",
            width=100,
            fg_color="#FF3C5F",
            hover_color="#E5354D",
            corner_radius=8,
            command=self.save_settings
        )
        self.save_button.pack(side="right", padx=20, pady=15)
        
        # İptal butonu
        self.cancel_button = ctk.CTkButton(
            self.button_frame,
            text="Cancel",
            width=100,
            fg_color="#333333",
            hover_color="#444444",
            corner_radius=8,
            command=self.destroy
        )
        self.cancel_button.pack(side="right", padx=5, pady=15)
    
    def create_section(self, title, content_functions):
        """Ayarlar için bir bölüm oluşturur"""
        section = ctk.CTkFrame(self.content, fg_color="#1A1A1A", corner_radius=10)
        section.pack(fill="x", pady=10)
        
        # Bölüm başlığı
        ctk.CTkLabel(
            section,
            text=title,
            font=ctk.CTkFont(family="Segoe UI", size=16, weight="bold")
        ).pack(anchor="w", padx=15, pady=(15, 10))
        
        # İçerik ayırıcı çizgi
        separator = ctk.CTkFrame(section, height=1, fg_color="#333333")
        separator.pack(fill="x", padx=15, pady=5)
        
        # Ayarlar içeriği
        content_frame = ctk.CTkFrame(section, fg_color="transparent")
        content_frame.pack(fill="x", padx=15, pady=10)
        
        # İçerik fonksiyonlarını çağır
        for func in content_functions:
            func(content_frame)
    

    def create_autosave_setting(self, parent):
        """Otomatik kaydetme ayarı"""
        frame = ctk.CTkFrame(parent, fg_color="transparent")
        frame.pack(fill="x", pady=5)
        
        ctk.CTkLabel(
            frame,
            text="Auto Save Interval",
            font=ctk.CTkFont(family="Segoe UI", size=14)
        ).pack(side="left")
        
        # Değer
        self.autosave_var = tk.IntVar(value=getattr(self.master, "autosave_interval", 30))
        
        # Slider
        self.autosave_slider = ctk.CTkSlider(
            frame,
            from_=5,
            to=120,
            number_of_steps=23,
            variable=self.autosave_var,
            width=150,
            progress_color="#FF3C5F"
        )
        self.autosave_slider.pack(side="right", padx=(10, 0))
        
        # Değer gösterimi
        self.autosave_value = ctk.CTkLabel(
            frame,
            text=f"{self.autosave_var.get()} sec",
            width=60,
            font=ctk.CTkFont(family="Segoe UI", size=14)
        )
        self.autosave_value.pack(side="right")
        
        # Değer değişimini izle
        self.autosave_var.trace_add("write", lambda *args: 
            self.autosave_value.configure(text=f"{self.autosave_var.get()} sec")
        )
    
        
    
    def create_quality_setting(self, parent):
        """Render kalitesi ayarı"""
        frame = ctk.CTkFrame(parent, fg_color="transparent")
        frame.pack(fill="x", pady=5)
        
        ctk.CTkLabel(
            frame,
            text="Render Quality",
            font=ctk.CTkFont(family="Segoe UI", size=14)
        ).pack(side="left")
        
        # Kalite seçenekleri
        quality_options = ["Draft", "Normal", "High", "Ultra"]
        self.quality_var = tk.StringVar(value="Normal")
        
        # OptionMenu
        self.quality_menu = ctk.CTkOptionMenu(
            frame,
            values=quality_options,
            variable=self.quality_var,
            width=120,
            fg_color="#333333",
            button_color="#FF3C5F",
            button_hover_color="#E5354D",
            dropdown_fg_color="#1A1A1A",
            dropdown_hover_color="#333333"
        )
        self.quality_menu.pack(side="right")
    
    def create_cache_setting(self, parent):
        """Önbellek ayarı"""
        frame = ctk.CTkFrame(parent, fg_color="transparent")
        frame.pack(fill="x", pady=5)
        
        ctk.CTkLabel(
            frame,
            text="Cache Size",
            font=ctk.CTkFont(family="Segoe UI", size=14)
        ).pack(side="left")
        
        # Değer
        self.cache_var = tk.IntVar(value=512)
        
        # Slider
        self.cache_slider = ctk.CTkSlider(
            frame,
            from_=128,
            to=2048,
            number_of_steps=15,
            variable=self.cache_var,
            width=150,
            progress_color="#FF3C5F"
        )
        self.cache_slider.pack(side="right", padx=(10, 0))
        
        # Değer gösterimi
        self.cache_value = ctk.CTkLabel(
            frame,
            text=f"{self.cache_var.get()} MB",
            width=70,
            font=ctk.CTkFont(family="Segoe UI", size=14)
        )
        self.cache_value.pack(side="right")
        
        # Değer değişimini izle
        self.cache_var.trace_add("write", lambda *args: 
            self.cache_value.configure(text=f"{self.cache_var.get()} MB")
        )
    
    def create_animation_setting(self, parent):
        """Animasyon ayarı"""
        frame = ctk.CTkFrame(parent, fg_color="transparent")
        frame.pack(fill="x", pady=5)
        
        ctk.CTkLabel(
            frame,
            text="UI Animations",
            font=ctk.CTkFont(family="Segoe UI", size=14)
        ).pack(side="left")
        
        # Switch
        self.animation_var = tk.BooleanVar(value=True)
        self.animation_switch = ctk.CTkSwitch(
            frame,
            text="",
            variable=self.animation_var,
            progress_color="#FF3C5F",
            button_color="#FFFFFF",
            button_hover_color="#DDDDDD",
            width=40
        )
        self.animation_switch.pack(side="right")
    
    def create_accent_color_setting(self, parent):
        """Vurgu rengi ayarı"""
        frame = ctk.CTkFrame(parent, fg_color="transparent")
        frame.pack(fill="x", pady=5)
        
        ctk.CTkLabel(
            frame,
            text="Accent Color",
            font=ctk.CTkFont(family="Segoe UI", size=14)
        ).pack(side="left")
        
        # Renk seçenekleri
        color_options = {
            "Red": "#FF3C5F",
            "Blue": "#3C71FF",
            "Purple": "#8A2BE2", 
            "Green": "#00B894",
            "Orange": "#FF9F1A"
        }
        
        # Renk butonları için frame
        color_frame = ctk.CTkFrame(frame, fg_color="transparent")
        color_frame.pack(side="right")
        
        # Aktif renk seçimi
        self.accent_color_var = tk.StringVar(value="Red")
        
        # Renk seçim butonları
        for i, (name, color) in enumerate(color_options.items()):
            radio = ctk.CTkRadioButton(
                color_frame,
                text="",
                variable=self.accent_color_var,
                value=name,
                radiobutton_height=20,
                radiobutton_width=20,
                border_width_checked=5,
                border_width_unchecked=2,
                border_color=color,
                fg_color=color,
                hover_color=color
            )
            radio.grid(row=0, column=i, padx=5)
    
    def save_settings(self):
        """Ayarları kaydet"""
        # Ayarları ana pencereye uygula
        self.master.autosave_interval = self.autosave_var.get()
        self.destroy()

if __name__ == "__main__":
    if check_for_update_blocking():  # True dönerse devam
        app = MainMenu()
        app.mainloop()

